#!/usr/bin/env python3
"""
Offline Render → Training Ingestion Pipeline

1) Upload offline render frames + metadata to S3
2) Create/update prompts mapping for training
3) (Optional) trigger AWS training run

Usage:
  python scripts/offline_render_pipeline.py \
    --render-dir ./offline_renders/frames \
    --metadata-dir ./offline_renders/metadata \
    --prompts-file ./offline_renders/prompts.json \
    --s3-bucket hootner-frontend-504165876439 \
    --s3-prefix training-data/offline-render/frames/ \
    --trigger-training \
    --training-config config/aws_training_config.json
"""

import argparse
import json
import os
import sys
from pathlib import Path
import boto3
import subprocess

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".exr"}


def _ensure_trailing_slash(prefix: str) -> str:
    if not prefix:
        return prefix
    return prefix if prefix.endswith("/") else (prefix + "/")


def _strip_leading_dcim(rel_path: str) -> str:
    # Common camera roll layouts are like "DCIM/Camera/IMG_0001.JPG".
    # If present, strip the leading DCIM/ so keys are less noisy.
    norm = rel_path.replace("\\", "/").lstrip("./")
    parts = [p for p in norm.split("/") if p]
    if parts and parts[0].lower() == "dcim":
        parts = parts[1:]
    return "/".join(parts)


def _index_render_files(render_dir: Path):
    files = []
    for path in render_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS:
            files.append(path)
    by_basename = {}
    duplicates = set()
    for p in files:
        b = p.name
        if b in by_basename:
            duplicates.add(b)
        else:
            by_basename[b] = p
    return files, by_basename, duplicates


def normalize_prompts_mapping(
    prompts_path: Path,
    render_dir: Path,
    s3_prefix: str,
    key_mode: str,
    strip_dcim: bool,
):
    with open(prompts_path, "r", encoding="utf-8") as f:
        prompts = json.load(f)

    if not isinstance(prompts, dict):
        raise ValueError("Prompts file must be a JSON object mapping image key -> prompt")

    if key_mode not in {"auto", "basename", "relative"}:
        raise ValueError(f"Invalid --prompts-key-mode: {key_mode}")

    inferred = key_mode
    if key_mode == "auto":
        inferred = "relative" if any(("/" in k or "\\" in k) for k in prompts.keys()) else "basename"

    normalized = {}

    if inferred == "basename":
        _, by_basename, duplicates = _index_render_files(render_dir)
        if duplicates:
            dup_list = ", ".join(sorted(list(duplicates))[:10])
            raise ValueError(
                "Cannot convert basename prompts to relative prompts because render output has duplicate basenames. "
                f"Examples: {dup_list}"
            )

        for basename, prompt in prompts.items():
            if not isinstance(basename, str):
                continue
            p = by_basename.get(basename)
            if not p:
                # Keep original key; trainer will fall back to default prompt.
                continue
            rel = p.relative_to(render_dir).as_posix()
            rel = _strip_leading_dcim(rel) if strip_dcim else rel
            normalized[rel] = prompt

    else:
        # Relative mode: accept prefix-relative, full S3 keys, or local relative paths.
        prefix = s3_prefix
        for k, prompt in prompts.items():
            if not isinstance(k, str):
                continue
            key = k.replace("\\", "/").lstrip("./")
            if prefix and key.startswith(prefix):
                key = key[len(prefix):].lstrip("/")
            key = _strip_leading_dcim(key) if strip_dcim else key
            normalized[key] = prompt

    return normalized


def upload_directory(s3, bucket, prefix, local_dir):
    local_dir = Path(local_dir)
    uploaded = 0
    for path in local_dir.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTS:
            key = f"{prefix}{path.relative_to(local_dir).as_posix()}"
            s3.upload_file(str(path), bucket, key)
            uploaded += 1
    return uploaded


def upload_metadata(s3, bucket, prefix, metadata_dir):
    metadata_dir = Path(metadata_dir)
    uploaded = 0
    for path in metadata_dir.rglob("*.json"):
        if path.is_file():
            key = f"{prefix}{path.relative_to(metadata_dir).as_posix()}"
            s3.upload_file(str(path), bucket, key)
            uploaded += 1
    return uploaded


def main():
    repo_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Offline Render → Training Ingestion Pipeline")
    parser.add_argument("--render-dir", required=True, help="Local directory with rendered frames")
    parser.add_argument("--metadata-dir", required=True, help="Local directory with render metadata JSON")
    parser.add_argument("--prompts-file", required=True, help="JSON file mapping frame file → prompt")
    parser.add_argument("--s3-bucket", required=True, help="S3 bucket for training data")
    parser.add_argument("--s3-prefix", required=True, help="S3 prefix for frames (e.g., training-data/offline-render/frames/)")
    parser.add_argument("--s3-metadata-prefix", default="training-data/offline-render/metadata/",
                        help="S3 prefix for metadata JSON")
    parser.add_argument("--prompts-s3-key", default="training_prompts.json",
                        help="S3 key to upload normalized prompts JSON (default: training_prompts.json)")
    parser.add_argument("--prompts-key-mode", choices=["auto", "basename", "relative"], default="auto",
                        help="How to interpret prompts JSON keys. 'relative' is prefix-relative; 'basename' is filename-only.")
    parser.add_argument("--strip-dcim", dest="strip_dcim", action="store_true", default=True,
                        help="Strip leading DCIM/ from prompt keys (default: enabled)")
    parser.add_argument("--no-strip-dcim", dest="strip_dcim", action="store_false",
                        help="Do not strip DCIM/ from prompt keys")
    parser.add_argument("--trigger-training", action="store_true", help="Start AWS training after upload")
    parser.add_argument(
        "--trigger-training-mode",
        choices=["aws-launch", "local"],
        default="aws-launch",
        help="When --trigger-training is set: 'aws-launch' provisions an EC2 GPU node via launch_aws_training.py; 'local' runs aws_train_sd.py locally.",
    )
    parser.add_argument("--training-config", default="config/aws_training_config.json",
                        help="Training config JSON for aws_train_sd.py")

    args = parser.parse_args()

    s3 = boto3.client("s3")

    args.s3_prefix = _ensure_trailing_slash(args.s3_prefix)
    args.s3_metadata_prefix = _ensure_trailing_slash(args.s3_metadata_prefix)

    if not Path(args.prompts_file).exists():
        raise FileNotFoundError(f"Prompts file not found: {args.prompts_file}")

    render_dir = Path(args.render_dir)
    metadata_dir = Path(args.metadata_dir)

    # Normalize prompts (prefer prefix-relative paths)
    normalized_prompts = normalize_prompts_mapping(
        Path(args.prompts_file),
        render_dir,
        args.s3_prefix,
        args.prompts_key_mode,
        args.strip_dcim,
    )
    normalized_prompts_path = Path(args.prompts_file).with_name("training_prompts.normalized.json")
    with open(normalized_prompts_path, "w", encoding="utf-8") as f:
        json.dump(normalized_prompts, f, indent=2, ensure_ascii=False)

    # Upload frames
    uploaded_frames = upload_directory(s3, args.s3_bucket, args.s3_prefix, args.render_dir)

    # Upload metadata
    uploaded_meta = upload_metadata(s3, args.s3_bucket, args.s3_metadata_prefix, args.metadata_dir)

    # Upload prompts file (default key is what launch_aws_training.py downloads)
    prompts_key = args.prompts_s3_key
    s3.upload_file(str(normalized_prompts_path), args.s3_bucket, prompts_key)

    print(f"✅ Uploaded {uploaded_frames} frames to s3://{args.s3_bucket}/{args.s3_prefix}")
    print(f"✅ Uploaded {uploaded_meta} metadata files to s3://{args.s3_bucket}/{args.s3_metadata_prefix}")
    print(f"✅ Uploaded prompts to s3://{args.s3_bucket}/{prompts_key}")

    if args.trigger_training:
        # Update training config locally to use this prefix
        with open(args.training_config, "r", encoding="utf-8") as f:
            config = json.load(f)

        config["s3_data_prefix"] = args.s3_prefix
        # Keep trainer expecting the same local filename the launcher downloads.
        config["prompts_file"] = "./training_prompts.json"
        with open(args.training_config, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=2)

        if args.trigger_training_mode == "local":
            cmd = [sys.executable, str(repo_root / "scripts" / "aws_train_sd.py"), "--config", args.training_config]
            print("🚀 Starting local training:", " ".join(cmd))
            subprocess.run(cmd, check=True)
        else:
            # Ensure the EC2 launcher can download the config from S3.
            # We upload the config under scripts/ by default (launcher expects that).
            s3.upload_file(args.training_config, args.s3_bucket, "scripts/aws_training_config.json")
            cmd = [sys.executable, str(repo_root / "scripts" / "launch_aws_training.py"), "--config", args.training_config, "--action", "launch"]
            print("🚀 Launching AWS GPU training instance:", " ".join(cmd))
            subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
