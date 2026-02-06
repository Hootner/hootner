#!/usr/bin/env python3
"""
AWS GPU Render Job Runner
- Downloads render package from S3 (optional)
- Runs a render command (optional)
- Uploads frames + metadata to S3
- Updates training config to point at rendered frames
"""

import argparse
import json
import os
import shlex
import subprocess
import tarfile
import zipfile
from pathlib import Path
from typing import Any, Dict, Optional, Set, cast

import boto3  # type: ignore[import]

SUPPORTED_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".exr"}


def _ensure_trailing_slash(prefix: str) -> str:
    if not prefix:
        return prefix
    return prefix if prefix.endswith("/") else (prefix + "/")


def _safe_format(template: str, values: Dict[str, str]) -> str:
    class SafeDict(dict[str, str]):
        def __missing__(self, key: str) -> str:
            return "{" + key + "}"

    return template.format_map(SafeDict(values))


def _download_prefix(s3: Any, bucket: str, prefix: str, dest_dir: Path) -> None:
    dest_dir.mkdir(parents=True, exist_ok=True)
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        contents = cast(list[Dict[str, Any]], page.get("Contents", []) or [])
        for obj_dict in contents:
            key = cast(Optional[str], obj_dict.get("Key"))
            if not key or key.endswith("/"):
                continue
            rel = key[len(prefix):].lstrip("/")
            local_path = dest_dir / rel
            local_path.parent.mkdir(parents=True, exist_ok=True)
            s3.download_file(bucket, key, str(local_path))


def _upload_directory(
    s3: Any,
    bucket: str,
    prefix: str,
    local_dir: Path,
    exts: Optional[Set[str]] = None,
) -> int:
    local_dir = Path(local_dir)
    uploaded = 0
    for path in local_dir.rglob("*"):
        if not path.is_file():
            continue
        if exts and path.suffix.lower() not in exts:
            continue
        key = f"{prefix}{path.relative_to(local_dir).as_posix()}"
        s3.upload_file(str(path), bucket, key)
        uploaded += 1
    return uploaded


def run_render_job(config_path: Path) -> int:
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    render_cfg = config.get("render", {})
    job_cfg = render_cfg.get("job", {})
    unreal_cfg = render_cfg.get("unreal", {})
    octane_cfg = render_cfg.get("octane", {})
    compress_cfg = render_cfg.get("compress", {})

    if not job_cfg.get("enabled", False):
        print("ℹ️  Render job disabled in config. Skipping render stage.")
        return 0

    s3 = boto3.client("s3")  # type: ignore[assignment, call-overload]
    bucket = config["s3_bucket"]

    package_prefix = job_cfg.get("package_s3_prefix")
    work_dir = Path(job_cfg.get("work_dir", "/home/ubuntu/render_job"))
    frames_dir = work_dir / job_cfg.get("frames_dir", "frames")
    metadata_dir = work_dir / job_cfg.get("metadata_dir", "metadata")

    if package_prefix:
        package_prefix = _ensure_trailing_slash(package_prefix)
        print(f"⬇️  Downloading render package from s3://{bucket}/{package_prefix} → {work_dir}")
        _download_prefix(s3, bucket, package_prefix, work_dir)

    # Run render command if provided
    command = job_cfg.get("command") or unreal_cfg.get("command")
    if command:
        env = os.environ.copy()
        env.update({
            "RENDER_WORK_DIR": str(work_dir),
            "RENDER_FRAMES_DIR": str(frames_dir),
            "RENDER_METADATA_DIR": str(metadata_dir),
            "RENDER_OUTPUT_FORMAT": str(unreal_cfg.get("output_format", "png")),
            "RENDER_RAY_TRACING": str(unreal_cfg.get("ray_tracing", True)),
            "RENDER_PATH_TRACING": str(unreal_cfg.get("path_tracing", False)),
            "OCTANE_KERNEL": str(octane_cfg.get("kernel", "path_tracing")),
            "OCTANE_DIFFUSE_DEPTH": str(octane_cfg.get("diffuse_depth", 12)),
            "OCTANE_SPECULAR_DEPTH": str(octane_cfg.get("specular_depth", 6)),
            "OCTANE_GLOSSY_DEPTH": str(octane_cfg.get("glossy_depth", 6)),
            "OCTANE_SCATTER_DEPTH": str(octane_cfg.get("scatter_depth", 8)),
            "OCTANE_MAX_DEPTH": str(octane_cfg.get("max_depth", 24)),
            "OCTANE_GI_CLAMP": str(octane_cfg.get("gi_clamp", 50)),
            "OCTANE_MAX_SAMPLES": str(octane_cfg.get("max_samples", 512)),
            "OCTANE_PARALLEL_SAMPLES": str(octane_cfg.get("parallel_samples", 32)),
            "OCTANE_CAUSTIC_BLUR": str(octane_cfg.get("caustic_blur", 0.02)),
            "OCTANE_COHERENT_RATIO": str(octane_cfg.get("coherent_ratio", 0.1)),
            "OCTANE_ADAPTIVE_SAMPLING": str(octane_cfg.get("adaptive_sampling", True)),
            "OCTANE_ADAPTIVE_NOISE_THRESHOLD": str(octane_cfg.get("adaptive_noise_threshold", 0.03)),
            "OCTANE_ADAPTIVE_MIN_SAMPLES": str(octane_cfg.get("adaptive_min_samples", 128)),
            "OCTANE_DENOISER": str(octane_cfg.get("denoiser", True)),
        })

        values = {
            "work_dir": str(work_dir),
            "frames_dir": str(frames_dir),
            "metadata_dir": str(metadata_dir),
            "output_format": str(unreal_cfg.get("output_format", "png")),
            "ray_tracing": str(unreal_cfg.get("ray_tracing", True)),
            "path_tracing": str(unreal_cfg.get("path_tracing", False)),
            "octane_kernel": str(octane_cfg.get("kernel", "path_tracing")),
            "octane_diffuse_depth": str(octane_cfg.get("diffuse_depth", 12)),
            "octane_specular_depth": str(octane_cfg.get("specular_depth", 6)),
            "octane_glossy_depth": str(octane_cfg.get("glossy_depth", 6)),
            "octane_scatter_depth": str(octane_cfg.get("scatter_depth", 8)),
            "octane_max_depth": str(octane_cfg.get("max_depth", 24)),
            "octane_gi_clamp": str(octane_cfg.get("gi_clamp", 50)),
            "octane_max_samples": str(octane_cfg.get("max_samples", 512)),
            "octane_parallel_samples": str(octane_cfg.get("parallel_samples", 32)),
            "octane_caustic_blur": str(octane_cfg.get("caustic_blur", 0.02)),
            "octane_coherent_ratio": str(octane_cfg.get("coherent_ratio", 0.1)),
            "octane_adaptive_sampling": str(octane_cfg.get("adaptive_sampling", True)),
            "octane_adaptive_noise_threshold": str(octane_cfg.get("adaptive_noise_threshold", 0.03)),
            "octane_adaptive_min_samples": str(octane_cfg.get("adaptive_min_samples", 128)),
            "octane_denoiser": str(octane_cfg.get("denoiser", True)),
        }
        command = _safe_format(command, values)
        print(f"🎬 Running render command: {command}")

        if job_cfg.get("command_shell", True):
            subprocess.run(command, shell=True, check=True, env=env, cwd=str(work_dir))
        else:
            subprocess.run(shlex.split(command), check=True, env=env, cwd=str(work_dir))
    else:
        print("ℹ️  No render command provided. Assuming frames are already present.")

    frames_prefix = _ensure_trailing_slash(config.get("render_output_prefix", ""))
    metadata_prefix = _ensure_trailing_slash(config.get("render_metadata_prefix", ""))

    if frames_prefix:
        uploaded_frames = _upload_directory(s3, bucket, frames_prefix, frames_dir, SUPPORTED_EXTS)
        print(f"✅ Uploaded {uploaded_frames} frames to s3://{bucket}/{frames_prefix}")
    else:
        print("⚠️  render_output_prefix not set; skipping frame upload")

    if metadata_prefix:
        uploaded_meta = _upload_directory(s3, bucket, metadata_prefix, metadata_dir, {".json"})
        print(f"✅ Uploaded {uploaded_meta} metadata files to s3://{bucket}/{metadata_prefix}")
    else:
        print("⚠️  render_metadata_prefix not set; skipping metadata upload")

    # Optional compression/archive upload
    if compress_cfg.get("enabled"):
        output_prefix = _ensure_trailing_slash(compress_cfg.get("output_prefix", ""))
        if not output_prefix:
            print("⚠️  compress.output_prefix not set; skipping archive upload")
        else:
            archive_format = compress_cfg.get("format", "zip")
            target = compress_cfg.get("target", "frames")
            include_metadata = bool(compress_cfg.get("include_metadata", True))

            def _collect_sources() -> list[tuple[str, Path]]:
                sources: list[tuple[str, Path]] = []
                if target in ("frames", "both"):
                    sources.append(("frames", frames_dir))
                if target in ("metadata", "both") or include_metadata:
                    sources.append(("metadata", metadata_dir))
                return sources

            sources = _collect_sources()
            if sources:
                archive_base = work_dir / "render_archive"
                if archive_format == "zip":
                    archive_path = archive_base.with_suffix(".zip")
                    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                        for label, src in sources:
                            for path in src.rglob("*"):
                                if not path.is_file():
                                    continue
                                arcname = f"{label}/{path.relative_to(src).as_posix()}"
                                zf.write(path, arcname)
                elif archive_format in ("tar.gz", "tgz"):
                    archive_path = archive_base.with_suffix(".tar.gz")
                    with tarfile.open(archive_path, "w:gz") as tf:
                        for label, src in sources:
                            for path in src.rglob("*"):
                                if not path.is_file():
                                    continue
                                arcname = f"{label}/{path.relative_to(src).as_posix()}"
                                tf.add(path, arcname=arcname)
                else:
                    print(f"⚠️  Unsupported compress.format: {archive_format}")
                    archive_path = None

                if archive_path and archive_path.exists():
                    archive_key = f"{output_prefix}{archive_path.name}"
                    s3.upload_file(str(archive_path), bucket, archive_key)  # type: ignore[attr-defined]
                    print(f"✅ Uploaded archive to s3://{bucket}/{archive_key}")

                    if compress_cfg.get("delete_local_after_upload"):
                        try:
                            archive_path.unlink()
                        except Exception:
                            pass

    # Ensure training uses the rendered frames prefix
    if frames_prefix:
        config["s3_data_prefix"] = frames_prefix
        config_path.write_text(json.dumps(config, indent=2), encoding="utf-8")
        print(f"🧭 Updated s3_data_prefix → {frames_prefix}")

    return 0


def main():
    parser = argparse.ArgumentParser(description="AWS GPU Render Job Runner")
    parser.add_argument("--config", required=True, help="Path to training config JSON")
    args = parser.parse_args()

    raise SystemExit(run_render_job(Path(args.config)))


if __name__ == "__main__":
    main()
