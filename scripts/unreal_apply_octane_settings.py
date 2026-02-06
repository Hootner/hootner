#!/usr/bin/env python3
"""
Apply render settings inside Unreal before MRQ render.
- Reads HOOTNER_RENDER_CONFIG (defaults to repo config/aws_training_config.json)
- Applies render.unreal.console_vars
- Toggles UE ray tracing/path tracing cvars based on render.unreal settings
"""

import json
import os
from typing import Any, Optional, cast

import unreal  # type: ignore[import]


def _set_cvar(name: str, value: Any) -> None:
    cmd = f"{name} {value}"
    unreal.SystemLibrary.execute_console_command(unreal.EditorLevelLibrary.get_editor_world(), cmd)  # type: ignore[attr-defined]
    unreal.log(f"[hootner] Set cvar: {cmd}")  # type: ignore[attr-defined]


def _set_property(obj: Any, name: str, value: Any) -> None:
    if hasattr(obj, "set_editor_property"):
        try:
            obj.set_editor_property(name, value)
            return
        except Exception:
            pass
    if hasattr(obj, name):
        try:
            setattr(obj, name, value)
        except Exception:
            pass


def _find_setting(settings: Any, unreal_any: Any, class_names: list[str]) -> Optional[Any]:
    for class_name in class_names:
        cls = getattr(unreal_any, class_name, None)
        if cls:
            try:
                return settings.find_or_add_setting_by_class(cls)
            except Exception:
                continue
    return None


def _as_pair(value: Any) -> Optional[tuple[int, int]]:
    if isinstance(value, (list, tuple)):
        vals = list(value)  # type: ignore[arg-type]
        if len(vals) == 2:  # type: ignore[arg-type]
            try:
                return (int(vals[0]), int(vals[1]))  # type: ignore[arg-type]
            except Exception:
                return None
    return None


def _apply_mrq_settings(render_cfg: dict[str, Any]) -> None:
    mrq_cfg = cast(dict[str, Any], render_cfg.get("mrq", {}))
    unreal_cfg = cast(dict[str, Any], render_cfg.get("unreal", {}))
    mrq_config_path = cast(Optional[str], unreal_cfg.get("mrq_config"))

    unreal_any = cast(Any, unreal)

    if not mrq_cfg or not mrq_config_path:
        return

    config_asset = unreal_any.EditorAssetLibrary.load_asset(mrq_config_path)
    if not config_asset:
        unreal_any.log_warning(f"[hootner] MRQ config asset not found: {mrq_config_path}")
        return

    settings: Any = config_asset

    # Output settings
    output_setting = settings.find_or_add_setting_by_class(unreal_any.MoviePipelineOutputSetting)

    if "output_directory" in mrq_cfg:
        _set_property(output_setting, "output_directory", unreal_any.DirectoryPath(mrq_cfg["output_directory"]))
    if "output_file_name_format" in mrq_cfg:
        _set_property(output_setting, "file_name_format", mrq_cfg["output_file_name_format"])
    if "output_resolution" in mrq_cfg:
        res_pair = _as_pair(mrq_cfg.get("output_resolution"))
        if res_pair:
            _set_property(output_setting, "output_resolution", unreal_any.IntPoint(res_pair[0], res_pair[1]))
    if "use_custom_frame_rate" in mrq_cfg:
        _set_property(output_setting, "use_custom_frame_rate", bool(mrq_cfg["use_custom_frame_rate"]))
    if "output_frame_rate" in mrq_cfg:
        fr_pair = _as_pair(mrq_cfg.get("output_frame_rate"))
        if fr_pair:
            _set_property(output_setting, "output_frame_rate", unreal_any.FrameRate(fr_pair[0], fr_pair[1]))
    if "override_existing_output" in mrq_cfg:
        _set_property(output_setting, "override_existing_output", bool(mrq_cfg["override_existing_output"]))
    if "handle_frame_count" in mrq_cfg:
        _set_property(output_setting, "handle_frame_count", int(mrq_cfg["handle_frame_count"]))
    if "output_frame_step" in mrq_cfg:
        _set_property(output_setting, "output_frame_step", int(mrq_cfg["output_frame_step"]))
    if "use_custom_playback_range" in mrq_cfg:
        _set_property(output_setting, "use_custom_playback_range", bool(mrq_cfg["use_custom_playback_range"]))
    if "custom_start_frame" in mrq_cfg:
        _set_property(output_setting, "custom_start_frame", int(mrq_cfg["custom_start_frame"]))
    if "custom_end_frame" in mrq_cfg:
        _set_property(output_setting, "custom_end_frame", int(mrq_cfg["custom_end_frame"]))

    # Output format (enable correct image sequence setting)
    output_format = str(mrq_cfg.get("output_format", "")).lower()
    format_class_map: dict[str, Any] = {
        "exr": unreal_any.MoviePipelineImageSequenceOutput_EXR,
        "png": unreal_any.MoviePipelineImageSequenceOutput_PNG,
        "jpg": unreal_any.MoviePipelineImageSequenceOutput_JPG,
        "jpeg": unreal_any.MoviePipelineImageSequenceOutput_JPG,
        "bmp": unreal_any.MoviePipelineImageSequenceOutput_BMP,
    }
    if output_format in format_class_map:
        settings.find_or_add_setting_by_class(format_class_map[output_format])  # type: ignore[attr-defined]

    # Anti-aliasing settings
    aa_cfg = cast(dict[str, Any], mrq_cfg.get("anti_aliasing", {}))
    if aa_cfg:
        aa_setting = settings.find_or_add_setting_by_class(unreal_any.MoviePipelineAntiAliasingSetting)
        if "spatial_sample_count" in aa_cfg:
            _set_property(aa_setting, "spatial_sample_count", int(aa_cfg["spatial_sample_count"]))
        if "temporal_sample_count" in aa_cfg:
            _set_property(aa_setting, "temporal_sample_count", int(aa_cfg["temporal_sample_count"]))
        if "override_anti_aliasing" in aa_cfg:
            _set_property(aa_setting, "override_anti_aliasing", bool(aa_cfg["override_anti_aliasing"]))
        if "anti_aliasing_method" in aa_cfg:
            _set_property(aa_setting, "anti_aliasing_method", aa_cfg["anti_aliasing_method"])

    # Warm-up settings
    warm_cfg = cast(dict[str, Any], mrq_cfg.get("warm_up", {}))
    if warm_cfg:
        warm_setting = settings.find_or_add_setting_by_class(unreal_any.MoviePipelineWarmUpSetting)
        if "engine_warm_up_count" in warm_cfg:
            _set_property(warm_setting, "engine_warm_up_count", int(warm_cfg["engine_warm_up_count"]))
        if "render_warm_up_count" in warm_cfg:
            _set_property(warm_setting, "render_warm_up_count", int(warm_cfg["render_warm_up_count"]))

    # High resolution tiling
    high_cfg = cast(dict[str, Any], mrq_cfg.get("high_resolution", {}))
    if high_cfg and high_cfg.get("enabled"):
        high_setting = settings.find_or_add_setting_by_class(unreal_any.MoviePipelineHighResSetting)
        tile_pair = _as_pair(high_cfg.get("tile_count"))
        if tile_pair:
            _set_property(high_setting, "tile_count", unreal_any.IntPoint(tile_pair[0], tile_pair[1]))
        if "tile_overlap" in high_cfg:
            _set_property(high_setting, "tile_overlap", float(high_cfg["tile_overlap"]))
        if "allocate_history_per_tile" in high_cfg:
            _set_property(high_setting, "allocate_history_per_tile", bool(high_cfg["allocate_history_per_tile"]))

    # Console variables
    cvars = cast(dict[str, Any], mrq_cfg.get("console_variables", {}))
    for name, value in cvars.items():
        _set_cvar(str(name), value)

    # Deferred rendering (render pass)
    deferred_cfg = cast(dict[str, Any], mrq_cfg.get("deferred_rendering", {}))
    if deferred_cfg:
        deferred_setting = _find_setting(settings, unreal_any, [
            "MoviePipelineDeferredPassBase",
            "MoviePipelineDeferredPass",
        ])
        if deferred_setting:
            if "enabled" in deferred_cfg:
                _set_property(deferred_setting, "enabled", bool(deferred_cfg["enabled"]))
                _set_property(deferred_setting, "bEnabled", bool(deferred_cfg["enabled"]))

    # UI renderer (non-composited UMG)
    ui_cfg = cast(dict[str, Any], mrq_cfg.get("ui_renderer", {}))
    if ui_cfg:
        ui_setting = _find_setting(settings, unreal_any, [
            "MoviePipelineWidgetRenderer",
            "MoviePipelineWidgetRendererSettings",
            "MoviePipelineUIRenderer",
        ])
        if ui_setting and "enabled" in ui_cfg:
            _set_property(ui_setting, "enabled", bool(ui_cfg["enabled"]))
            _set_property(ui_setting, "bEnabled", bool(ui_cfg["enabled"]))

    # Burn-in overlay
    burn_cfg = cast(dict[str, Any], mrq_cfg.get("burn_in", {}))
    if burn_cfg:
        burn_setting = _find_setting(settings, unreal_any, ["MoviePipelineBurnInSetting"])
        if burn_setting:
            if "enabled" in burn_cfg:
                _set_property(burn_setting, "enabled", bool(burn_cfg["enabled"]))
                _set_property(burn_setting, "bEnabled", bool(burn_cfg["enabled"]))
            if burn_cfg.get("burn_in_class"):
                _set_property(burn_setting, "burn_in_class", burn_cfg["burn_in_class"])
                _set_property(burn_setting, "burn_in_class_path", burn_cfg["burn_in_class"])
            if "burn_in_to_separate_layer" in burn_cfg:
                separate = bool(burn_cfg["burn_in_to_separate_layer"])
                _set_property(burn_setting, "burn_in_to_separate_layer", separate)
                _set_property(burn_setting, "burn_in_to_file_output", separate)

    # Camera shutter
    camera_cfg = cast(dict[str, Any], mrq_cfg.get("camera", {}))
    if camera_cfg:
        cam_setting = _find_setting(settings, unreal_any, ["MoviePipelineCameraSetting"])
        if cam_setting and "shutter_angle" in camera_cfg:
            _set_property(cam_setting, "shutter_angle", float(camera_cfg["shutter_angle"]))

    # Game overrides
    game_cfg = cast(dict[str, Any], mrq_cfg.get("game_overrides", {}))
    if game_cfg:
        game_setting = _find_setting(settings, unreal_any, ["MoviePipelineGameOverrideSetting"])
        if game_setting:
            if "cinematic_quality_settings" in game_cfg:
                _set_property(game_setting, "cinematic_quality_settings", bool(game_cfg["cinematic_quality_settings"]))
            if "disable_hud" in game_cfg:
                _set_property(game_setting, "disable_hud", bool(game_cfg["disable_hud"]))
            if "override_game_mode" in game_cfg:
                _set_property(game_setting, "override_game_mode", bool(game_cfg["override_game_mode"]))
            if game_cfg.get("game_mode"):
                _set_property(game_setting, "game_mode", game_cfg["game_mode"])

    unreal_any.log("[hootner] MRQ settings applied.")


def main() -> None:
    config_path = os.environ.get(
        "HOOTNER_RENDER_CONFIG",
        "/home/ubuntu/hootner/config/aws_training_config.json",
    )

    if not os.path.exists(config_path):
        unreal.log_warning(f"[hootner] Render config not found: {config_path}")  # type: ignore[attr-defined]
        return

    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    render_cfg = config.get("render", {})
    unreal_cfg = render_cfg.get("unreal", {})

    # Apply ray tracing/path tracing toggles (standard UE cvars)
    if "ray_tracing" in unreal_cfg:
        _set_cvar("r.RayTracing", 1 if unreal_cfg.get("ray_tracing") else 0)

    if "path_tracing" in unreal_cfg:
        _set_cvar("r.PathTracing", 1 if unreal_cfg.get("path_tracing") else 0)

    # Apply any custom console vars
    console_vars = unreal_cfg.get("console_vars", {})
    if isinstance(console_vars, dict):
        from typing import cast

        typed_vars = cast(dict[str, Any], console_vars)
        for name, value in typed_vars.items():
            _set_cvar(str(name), value)

    _apply_mrq_settings(render_cfg)

    unreal.log("[hootner] Render settings applied.")  # type: ignore[attr-defined]


if __name__ == "__main__":
    main()
