"""
Comprehensive Monitoring and Logging System
Structured logging, Prometheus metrics, and performance profiling

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import logging
import logging.handlers
import json
import time
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import traceback
from functools import wraps
import torch


# ============================================================================
# Structured Logging
# ============================================================================


class StructuredLogger:
    """
    JSON-based structured logging with context

    Features:
    - JSON format for easy parsing
    - Request ID tracking
    - Performance metrics
    - Error context
    """

    def __init__(self, name: str, log_dir: str = "./logs", level: str = "INFO"):
        self.name = name
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)

        # Create logger
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, level.upper()))

        # Remove existing handlers
        self.logger.handlers = []

        # JSON formatter
        self.formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": %(message)s}'
        )

        # Console handler (human-readable)
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)

        # File handler (JSON)
        file_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / f"{name}.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5,
        )
        file_handler.setFormatter(self.formatter)
        self.logger.addHandler(file_handler)

        # Error file handler
        error_handler = logging.handlers.RotatingFileHandler(
            self.log_dir / f"{name}_errors.log",
            maxBytes=10 * 1024 * 1024,
            backupCount=5,
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(self.formatter)
        self.logger.addHandler(error_handler)

    def _format_message(self, message: str, **context) -> str:
        """Format message with context as JSON"""
        log_data = {"message": message, **context}
        return json.dumps(log_data)

    def info(self, message: str, **context):
        """Log info message"""
        self.logger.info(self._format_message(message, **context))

    def warning(self, message: str, **context):
        """Log warning message"""
        self.logger.warning(self._format_message(message, **context))

    def error(self, message: str, error: Optional[Exception] = None, **context):
        """Log error message with stack trace"""
        if error:
            context["error_type"] = type(error).__name__
            context["error_message"] = str(error)
            context["traceback"] = traceback.format_exc()

        self.logger.error(self._format_message(message, **context))

    def debug(self, message: str, **context):
        """Log debug message"""
        self.logger.debug(self._format_message(message, **context))

    def metric(self, metric_name: str, value: float, **tags):
        """Log metric"""
        self.info(
            f"Metric: {metric_name}",
            metric_name=metric_name,
            metric_value=value,
            metric_type="gauge",
            **tags,
        )


# ============================================================================
# Prometheus Metrics
# ============================================================================


class PrometheusMetrics:
    """
    Prometheus metrics collection

    Metrics types:
    - Counter: Monotonically increasing (requests, errors)
    - Gauge: Can go up/down (queue size, memory)
    - Histogram: Distribution (latency, size)
    - Summary: Similar to histogram with percentiles
    """

    def __init__(self):
        self.counters: Dict[str, float] = {}
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, list] = {}
        self.start_time = time.time()

    def inc_counter(self, name: str, value: float = 1.0, **labels):
        """Increment counter"""
        key = self._make_key(name, labels)
        self.counters[key] = self.counters.get(key, 0) + value

    def set_gauge(self, name: str, value: float, **labels):
        """Set gauge value"""
        key = self._make_key(name, labels)
        self.gauges[key] = value

    def observe_histogram(self, name: str, value: float, **labels):
        """Observe histogram value"""
        key = self._make_key(name, labels)
        if key not in self.histograms:
            self.histograms[key] = []
        self.histograms[key].append(value)

    def _make_key(self, name: str, labels: dict) -> str:
        """Create metric key with labels"""
        if not labels:
            return name

        label_str = ",".join(f'{k}="{v}"' for k, v in sorted(labels.items()))
        return f"{name}{{{label_str}}}"

    def export_prometheus(self) -> str:
        """Export metrics in Prometheus format"""
        lines = []

        # Counters
        for key, value in self.counters.items():
            name = key.split("{")[0]
            lines.append(f"# TYPE {name} counter")
            lines.append(f"{key} {value}")

        # Gauges
        for key, value in self.gauges.items():
            name = key.split("{")[0]
            lines.append(f"# TYPE {name} gauge")
            lines.append(f"{key} {value}")

        # Histograms
        for key, values in self.histograms.items():
            name = key.split("{")[0]
            lines.append(f"# TYPE {name} histogram")

            # Calculate percentiles
            sorted_values = sorted(values)
            count = len(sorted_values)

            if count > 0:
                p50 = sorted_values[int(count * 0.5)]
                p95 = sorted_values[int(count * 0.95)]
                p99 = sorted_values[int(count * 0.99)]

                lines.append(f"{key}_sum {sum(sorted_values)}")
                lines.append(f"{key}_count {count}")
                lines.append(f'{key}{{quantile="0.5"}} {p50}')
                lines.append(f'{key}{{quantile="0.95"}} {p95}')
                lines.append(f'{key}{{quantile="0.99"}} {p99}')

        # Uptime
        uptime = time.time() - self.start_time
        lines.append(f"# TYPE process_uptime_seconds gauge")
        lines.append(f"process_uptime_seconds {uptime}")

        return "\n".join(lines) + "\n"

    def get_stats(self) -> dict:
        """Get metrics as dictionary"""
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                k: {
                    "count": len(v),
                    "mean": sum(v) / len(v) if v else 0,
                    "min": min(v) if v else 0,
                    "max": max(v) if v else 0,
                }
                for k, v in self.histograms.items()
            },
            "uptime": time.time() - self.start_time,
        }


# ============================================================================
# Performance Profiling
# ============================================================================


class PerformanceProfiler:
    """
    Performance profiling and timing

    Features:
    - Function timing decorator
    - GPU memory tracking
    - Context manager for code blocks
    """

    def __init__(self, logger: Optional[StructuredLogger] = None):
        self.logger = logger
        self.timings: Dict[str, list] = {}

    def timer(self, name: Optional[str] = None):
        """
        Decorator for timing functions

        Usage:
            @profiler.timer()
            def my_function():
                ...
        """

        def decorator(func):
            func_name = name or f"{func.__module__}.{func.__name__}"

            @wraps(func)
            def wrapper(*args, **kwargs):
                start = time.time()

                # Track GPU memory
                if torch.cuda.is_available():
                    torch.cuda.reset_peak_memory_stats()
                    mem_before = torch.cuda.memory_allocated()

                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    elapsed = time.time() - start

                    # Log timing
                    if func_name not in self.timings:
                        self.timings[func_name] = []
                    self.timings[func_name].append(elapsed)

                    # Log GPU memory
                    if torch.cuda.is_available():
                        mem_after = torch.cuda.memory_allocated()
                        peak_mem = torch.cuda.max_memory_allocated()
                        mem_delta = (mem_after - mem_before) / (1024**2)
                        peak_mem_mb = peak_mem / (1024**2)

                        if self.logger:
                            self.logger.info(
                                f"Function {func_name} completed",
                                function=func_name,
                                duration_ms=elapsed * 1000,
                                memory_delta_mb=mem_delta,
                                peak_memory_mb=peak_mem_mb,
                            )
                    else:
                        if self.logger:
                            self.logger.info(
                                f"Function {func_name} completed",
                                function=func_name,
                                duration_ms=elapsed * 1000,
                            )

            return wrapper

        return decorator

    def time_block(self, name: str):
        """
        Context manager for timing code blocks

        Usage:
            with profiler.time_block("my_operation"):
                ...
        """
        return TimingContext(name, self)

    def get_stats(self) -> dict:
        """Get timing statistics"""
        stats = {}

        for name, timings in self.timings.items():
            if timings:
                stats[name] = {
                    "count": len(timings),
                    "total": sum(timings),
                    "mean": sum(timings) / len(timings),
                    "min": min(timings),
                    "max": max(timings),
                    "p95": (
                        sorted(timings)[int(len(timings) * 0.95)]
                        if len(timings) > 1
                        else timings[0]
                    ),
                }

        return stats

    def print_stats(self):
        """Print timing statistics"""
        stats = self.get_stats()

        print("\n" + "=" * 80)
        print("Performance Profile")
        print("=" * 80)

        for name, data in sorted(stats.items()):
            print(f"\n{name}:")
            print(f"  Count:   {data['count']}")
            print(f"  Total:   {data['total']*1000:.2f} ms")
            print(f"  Mean:    {data['mean']*1000:.2f} ms")
            print(f"  Min:     {data['min']*1000:.2f} ms")
            print(f"  Max:     {data['max']*1000:.2f} ms")
            print(f"  P95:     {data['p95']*1000:.2f} ms")

        print("\n" + "=" * 80)


class TimingContext:
    """Context manager for timing code blocks"""

    def __init__(self, name: str, profiler: PerformanceProfiler):
        self.name = name
        self.profiler = profiler
        self.start_time = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start_time

        if self.name not in self.profiler.timings:
            self.profiler.timings[self.name] = []
        self.profiler.timings[self.name].append(elapsed)

        if self.profiler.logger:
            self.profiler.logger.info(
                f"Block {self.name} completed",
                block=self.name,
                duration_ms=elapsed * 1000,
            )


# ============================================================================
# Error Tracking
# ============================================================================


class ErrorTracker:
    """
    Track and aggregate errors

    Features:
    - Error frequency tracking
    - Error context storage
    - Alert thresholds
    """

    def __init__(self, alert_threshold: int = 10):
        self.errors: Dict[str, list] = {}
        self.alert_threshold = alert_threshold
        self.logger = StructuredLogger("error_tracker")

    def track_error(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Track an error occurrence"""
        error_type = type(error).__name__
        error_message = str(error)

        if error_type not in self.errors:
            self.errors[error_type] = []

        error_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "message": error_message,
            "traceback": traceback.format_exc(),
            "context": context or {},
        }

        self.errors[error_type].append(error_data)

        # Log error
        self.logger.error(f"Error tracked: {error_type}", error=error, **error_data)

        # Check if threshold exceeded
        if len(self.errors[error_type]) >= self.alert_threshold:
            self._trigger_alert(error_type)

    def _trigger_alert(self, error_type: str):
        """Trigger alert for high error frequency"""
        count = len(self.errors[error_type])

        self.logger.error(
            f"⚠️  ALERT: High error frequency detected",
            error_type=error_type,
            error_count=count,
            threshold=self.alert_threshold,
        )

    def get_error_summary(self) -> dict:
        """Get error summary"""
        summary = {}

        for error_type, occurrences in self.errors.items():
            summary[error_type] = {
                "count": len(occurrences),
                "first_seen": occurrences[0]["timestamp"] if occurrences else None,
                "last_seen": occurrences[-1]["timestamp"] if occurrences else None,
                "recent_messages": [e["message"] for e in occurrences[-5:]],
            }

        return summary

    def clear_errors(self):
        """Clear error history"""
        self.errors.clear()


# ============================================================================
# Monitoring Dashboard Data
# ============================================================================


class MonitoringDashboard:
    """
    Aggregate monitoring data for dashboard

    Combines metrics, logs, and performance data
    """

    def __init__(self):
        self.logger = StructuredLogger("monitoring")
        self.metrics = PrometheusMetrics()
        self.profiler = PerformanceProfiler(self.logger)
        self.error_tracker = ErrorTracker()

    def get_dashboard_data(self) -> dict:
        """Get all monitoring data for dashboard"""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "metrics": self.metrics.get_stats(),
            "performance": self.profiler.get_stats(),
            "errors": self.error_tracker.get_error_summary(),
            "system": self._get_system_stats(),
        }

    def _get_system_stats(self) -> dict:
        """Get system statistics"""
        stats = {}

        # GPU stats
        if torch.cuda.is_available():
            stats["gpu"] = {
                "available": True,
                "device_count": torch.cuda.device_count(),
                "current_device": torch.cuda.current_device(),
                "device_name": torch.cuda.get_device_name(0),
                "memory_allocated_mb": torch.cuda.memory_allocated() / (1024**2),
                "memory_reserved_mb": torch.cuda.memory_reserved() / (1024**2),
                "max_memory_allocated_mb": torch.cuda.max_memory_allocated()
                / (1024**2),
            }
        else:
            stats["gpu"] = {"available": False}

        # PyTorch version
        stats["pytorch_version"] = torch.__version__

        return stats

    def export_to_file(self, filepath: str):
        """Export dashboard data to JSON file"""
        data = self.get_dashboard_data()

        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

        self.logger.info(f"Dashboard data exported to {filepath}")


# ============================================================================
# Global Monitoring Instance
# ============================================================================

# Create global monitoring instance
monitoring = MonitoringDashboard()

# Export for easy access
logger = monitoring.logger
metrics = monitoring.metrics
profiler = monitoring.profiler
error_tracker = monitoring.error_tracker
