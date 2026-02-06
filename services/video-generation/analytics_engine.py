"""
Advanced Video Analytics Engine
Real-time engagement tracking and viewer insights

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import json
import logging

logger = logging.getLogger(__name__)


class VideoAnalytics:
    """
    Track and analyze video engagement metrics

    Features:
    - View tracking
    - Engagement heatmaps
    - Drop-off analysis
    - A/B testing support
    - Retention curves
    - Quality of Service (QoS) metrics
    """

    def __init__(self, video_id: str, duration: float):
        self.video_id = video_id
        self.duration = duration

        # Viewing sessions
        self.sessions: Dict[str, Dict] = {}

        # Aggregate metrics (time-based buckets)
        self.bucket_size = 1.0  # 1 second buckets
        num_buckets = int(duration / self.bucket_size) + 1
        self.view_counts = np.zeros(num_buckets)
        self.engagement_scores = np.zeros(num_buckets)
        self.quality_scores = np.zeros(num_buckets)

        # Event tracking
        self.events: List[Dict] = []

        # Statistics
        self.stats = {
            "total_views": 0,
            "unique_viewers": set(),
            "total_watch_time": 0,
            "avg_watch_time": 0,
            "completion_rate": 0,
            "replay_count": 0,
            "pause_count": 0,
            "seek_count": 0,
            "quality_changes": 0,
            "buffer_events": 0,
        }

    def start_session(
        self, session_id: str, user_id: str, metadata: Optional[Dict] = None
    ):
        """Start new viewing session"""
        # Validate inputs
        if not session_id or not user_id:
            raise ValueError("session_id and user_id are required")
        
        if session_id in self.sessions:
            logger.warning(f"Session {session_id} already exists, overwriting")
        
        self.sessions[session_id] = {
            "session_id": session_id,
            "user_id": user_id,
            "started_at": datetime.now(),
            "last_update": datetime.now(),
            "watch_time": 0,
            "max_position": 0,
            "positions_watched": set(),
            "events": [],
            "metadata": metadata or {},
            "quality_issues": 0,
            "pauses": 0,
            "seeks": 0,
            "completed": False,
        }

        self.stats["total_views"] += 1
        self.stats["unique_viewers"].add(user_id)

        logger.info(f"📊 Session {session_id} started for video {self.video_id}")

    def track_playback(
        self,
        session_id: str,
        current_time: float,
        playback_rate: float = 1.0,
        quality_level: Optional[str] = None,
    ):
        """Track playback position"""
        if session_id not in self.sessions:
            logger.warning(f"Session {session_id} not found")
            return
        
        # Validate current_time
        if current_time < 0 or current_time > self.duration:
            logger.warning(f"Invalid current_time: {current_time}")
            return

        session = self.sessions[session_id]
        session["last_update"] = datetime.now()
        session["max_position"] = max(session["max_position"], current_time)

        # Track which positions were watched
        bucket_idx = int(current_time / self.bucket_size)
        if 0 <= bucket_idx < len(self.view_counts):
            self.view_counts[bucket_idx] += 1
            session["positions_watched"].add(bucket_idx)

        # Update engagement score (higher for normal speed playback)
        if 0.9 <= playback_rate <= 1.1:
            engagement = 1.0
        elif 0.5 <= playback_rate < 0.9:
            engagement = 0.7
        else:
            engagement = 0.3

        if 0 <= bucket_idx < len(self.engagement_scores):
            self.engagement_scores[bucket_idx] += engagement

    def track_event(
        self,
        session_id: str,
        event_type: str,
        timestamp: float,
        data: Optional[Dict] = None,
    ):
        """Track video event"""
        # Validate inputs
        if not event_type:
            logger.warning("event_type is required")
            return
        
        if timestamp < 0 or timestamp > self.duration:
            logger.warning(f"Invalid timestamp: {timestamp}")
            return
        
        event = {
            "session_id": session_id,
            "event_type": event_type,
            "timestamp": timestamp,
            "occurred_at": datetime.now().isoformat(),
            "data": data or {},
        }

        self.events.append(event)

        if session_id in self.sessions:
            session = self.sessions[session_id]
            session["events"].append(event)

            # Update stats
            if event_type == "pause":
                session["pauses"] += 1
                self.stats["pause_count"] += 1

            elif event_type == "seek":
                session["seeks"] += 1
                self.stats["seek_count"] += 1

            elif event_type == "quality_change":
                self.stats["quality_changes"] += 1

            elif event_type == "buffer":
                session["quality_issues"] += 1
                self.stats["buffer_events"] += 1

                # Track buffer locations
                bucket_idx = int(timestamp / self.bucket_size)
                if 0 <= bucket_idx < len(self.quality_scores):
                    self.quality_scores[bucket_idx] -= 0.5

            elif event_type == "replay":
                self.stats["replay_count"] += 1

            elif event_type == "complete":
                session["completed"] = True

    def end_session(self, session_id: str):
        """End viewing session"""
        if session_id not in self.sessions:
            logger.warning(f"Session {session_id} not found")
            return

        session = self.sessions[session_id]
        session["ended_at"] = datetime.now()

        # Calculate watch time
        try:
            duration = (session["ended_at"] - session["started_at"]).total_seconds()
            session["watch_time"] = duration
        except (KeyError, TypeError) as e:
            logger.error(f"Failed to calculate watch time: {e}")
            session["watch_time"] = 0

        # Calculate coverage
        session["coverage"] = len(session["positions_watched"]) * self.bucket_size
        session["coverage_pct"] = (session["coverage"] / self.duration) * 100

        # Update aggregate stats
        self.stats["total_watch_time"] += duration

        logger.info(
            f"📊 Session {session_id} ended - {session['coverage_pct']:.1f}% watched"
        )

    def get_heatmap(self, resolution: int = 100) -> List[Dict]:
        """
        Generate engagement heatmap

        Args:
            resolution: Number of data points

        Returns:
            List of heatmap segments
        """
        # Downsample to requested resolution
        segment_size = len(self.view_counts) / resolution
        heatmap = []

        for i in range(resolution):
            start_idx = int(i * segment_size)
            end_idx = int((i + 1) * segment_size)

            segment_views = np.sum(self.view_counts[start_idx:end_idx])
            segment_engagement = np.mean(self.engagement_scores[start_idx:end_idx])

            start_time = start_idx * self.bucket_size
            end_time = end_idx * self.bucket_size

            heatmap.append(
                {
                    "start_time": start_time,
                    "end_time": end_time,
                    "view_count": int(segment_views),
                    "engagement_score": float(segment_engagement),
                    "relative_engagement": segment_views
                    / max(self.stats["total_views"], 1),
                }
            )

        return heatmap

    def get_dropoff_analysis(self) -> List[Dict]:
        """Analyze where viewers drop off"""
        dropoffs = []

        # Calculate retention at each time point
        total_sessions = len(self.sessions)
        if total_sessions == 0:
            return dropoffs

        prev_viewers = total_sessions
        threshold = total_sessions * 0.1  # 10% drop threshold

        for i in range(len(self.view_counts)):
            current_viewers = self.view_counts[i]

            # Detect significant drop
            if prev_viewers - current_viewers >= threshold:
                dropoffs.append(
                    {
                        "timestamp": i * self.bucket_size,
                        "viewers_lost": int(prev_viewers - current_viewers),
                        "retention_before": prev_viewers / total_sessions,
                        "retention_after": current_viewers / total_sessions,
                        "drop_percentage": (
                            (prev_viewers - current_viewers) / prev_viewers
                        )
                        * 100,
                    }
                )

            prev_viewers = current_viewers

        return dropoffs

    def get_retention_curve(self, resolution: int = 100) -> List[Dict]:
        """Generate viewer retention curve"""
        segment_size = len(self.view_counts) / resolution
        total_sessions = len(self.sessions)

        if total_sessions == 0:
            return []

        curve = []

        for i in range(resolution):
            idx = int(i * segment_size)
            viewers = self.view_counts[idx] if idx < len(self.view_counts) else 0
            retention = viewers / total_sessions

            curve.append(
                {
                    "timestamp": idx * self.bucket_size,
                    "retention": float(retention),
                    "viewers": int(viewers),
                    "percentage": retention * 100,
                }
            )

        return curve

    def get_statistics(self) -> Dict:
        """Get comprehensive statistics"""
        total_sessions = len(self.sessions)

        if total_sessions > 0:
            self.stats["avg_watch_time"] = (
                self.stats["total_watch_time"] / total_sessions
            )

            # Calculate completion rate
            completed = sum(
                1 for s in self.sessions.values() if s.get("completed", False)
            )
            self.stats["completion_rate"] = (completed / total_sessions) * 100

        return {
            **self.stats,
            "unique_viewers": len(self.stats["unique_viewers"]),
            "total_sessions": total_sessions,
            "video_duration": self.duration,
        }

    def export_report(self) -> Dict:
        """Export comprehensive analytics report"""
        return {
            "video_id": self.video_id,
            "generated_at": datetime.now().isoformat(),
            "statistics": self.get_statistics(),
            "heatmap": self.get_heatmap(),
            "dropoff_points": self.get_dropoff_analysis(),
            "retention_curve": self.get_retention_curve(),
            "quality_issues": {
                "buffer_events": self.stats["buffer_events"],
                "quality_changes": self.stats["quality_changes"],
                "affected_segments": self._get_quality_issues(),
            },
        }

    def _get_quality_issues(self) -> List[Dict]:
        """Identify segments with quality issues"""
        issues = []

        for i in range(len(self.quality_scores)):
            if self.quality_scores[i] < -2:  # Multiple buffer events
                issues.append(
                    {
                        "timestamp": i * self.bucket_size,
                        "severity": abs(self.quality_scores[i]),
                        "description": "Frequent buffering reported",
                    }
                )

        return issues


class ABTestManager:
    """
    A/B testing for video features

    Features:
    - Multiple variants
    - Statistical significance
    - Conversion tracking
    - Automatic winner selection
    """

    def __init__(self, test_name: str):
        self.test_name = test_name
        self.variants: Dict[str, Dict] = {}
        self.started_at = datetime.now()

    def add_variant(self, variant_id: str, description: str, config: Dict):
        """Add test variant"""
        self.variants[variant_id] = {
            "variant_id": variant_id,
            "description": description,
            "config": config,
            "impressions": 0,
            "conversions": 0,
            "engagement_scores": [],
            "watch_times": [],
        }

    def assign_variant(self, user_id: str) -> str:
        """Assign user to variant (simple random)"""
        import random
        
        if not user_id:
            logger.warning("user_id is required")
            return None

        variant_ids = list(self.variants.keys())
        if not variant_ids:
            logger.warning("No variants available")
            return None

        # Simple random assignment
        return random.choice(variant_ids)

    def track_impression(self, variant_id: str):
        """Track variant impression"""
        if variant_id in self.variants:
            self.variants[variant_id]["impressions"] += 1

    def track_conversion(
        self, variant_id: str, engagement_score: float, watch_time: float
    ):
        """Track conversion/completion"""
        if variant_id in self.variants:
            variant = self.variants[variant_id]
            variant["conversions"] += 1
            variant["engagement_scores"].append(engagement_score)
            variant["watch_times"].append(watch_time)

    def get_results(self) -> Dict:
        """Get test results"""
        results = {}

        for variant_id, variant in self.variants.items():
            impressions = variant["impressions"]
            conversions = variant["conversions"]

            conversion_rate = (
                (conversions / impressions * 100) if impressions > 0 else 0
            )

            avg_engagement = (
                np.mean(variant["engagement_scores"])
                if variant["engagement_scores"]
                else 0
            )
            avg_watch_time = (
                np.mean(variant["watch_times"]) if variant["watch_times"] else 0
            )

            results[variant_id] = {
                "description": variant["description"],
                "impressions": impressions,
                "conversions": conversions,
                "conversion_rate": conversion_rate,
                "avg_engagement": float(avg_engagement),
                "avg_watch_time": float(avg_watch_time),
            }

        # Determine winner (highest conversion rate)
        if results:
            winner = max(results.items(), key=lambda x: x[1]["conversion_rate"])
            results["winner"] = {
                "variant_id": winner[0],
                "conversion_rate": winner[1]["conversion_rate"],
            }

        return results


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("Advanced Video Analytics Engine")
    print("=" * 60)

    # Create analytics tracker
    analytics = VideoAnalytics("video123", duration=120.0)

    # Simulate viewing sessions
    print("\n📊 Simulating viewing sessions...")

    for i in range(10):
        session_id = f"session_{i}"
        user_id = f"user_{i}"

        analytics.start_session(session_id, user_id)

        # Simulate playback
        for t in range(0, 120, 5):
            analytics.track_playback(session_id, float(t))

        # Some events
        if i % 3 == 0:
            analytics.track_event(session_id, "pause", 30.0)

        if i % 5 == 0:
            analytics.track_event(session_id, "buffer", 45.0)

        analytics.end_session(session_id)

    # Get statistics
    stats = analytics.get_statistics()
    print(f"\n📈 Statistics:")
    print(f"   Total views: {stats['total_views']}")
    print(f"   Unique viewers: {stats['unique_viewers']}")
    print(f"   Avg watch time: {stats['avg_watch_time']:.1f}s")
    print(f"   Completion rate: {stats['completion_rate']:.1f}%")

    # Export report
    report = analytics.export_report()
    print(
        f"\n✅ Generated analytics report with {len(report['heatmap'])} heatmap points"
    )

    print("\n✅ Analytics engine ready!")
