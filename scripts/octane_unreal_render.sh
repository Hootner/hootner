#!/bin/bash
# Octane + Unreal render wrapper for AWS GPU nodes
# Uses env vars from aws_render_job.py to build an Octane settings JSON

set -euo pipefail

UNREAL_CMD=""
PROJECT_FILE=""
MRQ_CONFIG=""
OUTPUT_DIR=""
OCTANE_SETTINGS=""
APPLY_SCRIPT="/home/ubuntu/hootner/scripts/unreal_apply_octane_settings.py"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --unreal-cmd)
      UNREAL_CMD="$2"; shift 2 ;;
    --project)
      PROJECT_FILE="$2"; shift 2 ;;
    --mrq-config)
      MRQ_CONFIG="$2"; shift 2 ;;
    --output)
      OUTPUT_DIR="$2"; shift 2 ;;
    --octane-settings)
      OCTANE_SETTINGS="$2"; shift 2 ;;
    --apply-script)
      APPLY_SCRIPT="$2"; shift 2 ;;
    *)
      echo "Unknown arg: $1"; exit 1 ;;
  esac
 done

if [[ -z "$UNREAL_CMD" || -z "$PROJECT_FILE" || -z "$MRQ_CONFIG" || -z "$OUTPUT_DIR" ]]; then
  echo "Usage: $0 --unreal-cmd <path> --project <.uproject> --mrq-config <asset> --output <dir> [--octane-settings <file>]"
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

if [[ -n "${OCTANE_SETTINGS}" ]]; then
  cat > "$OCTANE_SETTINGS" <<EOF
{
  "kernel": "${OCTANE_KERNEL:-path_tracing}",
  "diffuse_depth": ${OCTANE_DIFFUSE_DEPTH:-12},
  "specular_depth": ${OCTANE_SPECULAR_DEPTH:-6},
  "glossy_depth": ${OCTANE_GLOSSY_DEPTH:-6},
  "scatter_depth": ${OCTANE_SCATTER_DEPTH:-8},
  "max_depth": ${OCTANE_MAX_DEPTH:-24},
  "gi_clamp": ${OCTANE_GI_CLAMP:-50},
  "max_samples": ${OCTANE_MAX_SAMPLES:-512},
  "parallel_samples": ${OCTANE_PARALLEL_SAMPLES:-32},
  "caustic_blur": ${OCTANE_CAUSTIC_BLUR:-0.02},
  "coherent_ratio": ${OCTANE_COHERENT_RATIO:-0.1},
  "adaptive_sampling": ${OCTANE_ADAPTIVE_SAMPLING:-true},
  "adaptive_noise_threshold": ${OCTANE_ADAPTIVE_NOISE_THRESHOLD:-0.03},
  "adaptive_min_samples": ${OCTANE_ADAPTIVE_MIN_SAMPLES:-128},
  "denoiser": ${OCTANE_DENOISER:-true}
}
EOF
  echo "✅ Wrote Octane settings to ${OCTANE_SETTINGS}"
fi

export HOOTNER_RENDER_CONFIG="/home/ubuntu/hootner/config/aws_training_config.json"

# NOTE: OctaneRender for Unreal uses plugin/MRQ presets. Ensure your MRQ preset
# references Octane kernel/path tracing, or read OCTANE_SETTINGS in a custom Python hook.

"$UNREAL_CMD" \
  -project="${PROJECT_FILE}" \
  -ExecutePythonScript="${APPLY_SCRIPT}" \
  -RenderMovie \
  -MoviePipelineConfig="${MRQ_CONFIG}" \
  -MoviePipelineLocalExecutorClass=/Script/MovieRenderPipelineCore.MoviePipelinePIEExecutor \
  -Output="${OUTPUT_DIR}" \
  -log
