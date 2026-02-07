"""
Watch Party & Real-Time Collaboration
Synchronized video playback with live interaction

Author: HOOTNER AI Platform
Date: January 11, 2026
"""

import asyncio
import json
from typing import Dict, List, Set, Optional
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)


class WatchParty:
    """
    Watch party session management

    Features:
    - Synchronized playback across users
    - Host controls
    - Live chat
    - Reactions and emojis
    - User presence
    """

    def __init__(self, party_id: str, host_id: str, video_id: str):
        self.party_id = party_id
        self.host_id = host_id
        self.video_id = video_id
        self.created_at = datetime.now()

        # Party state
        self.participants: Dict[str, Dict] = {}  # user_id -> user_info
        self.is_playing = False
        self.current_time = 0.0
        self.playback_rate = 1.0
        self.last_sync_time = datetime.now()

        # Chat messages
        self.messages: List[Dict] = []
        self.max_messages = 500

        # Reactions
        self.active_reactions: Dict[str, List] = {}  # time -> [reactions]

        # Settings
        self.settings = {
            "host_only_controls": True,
            "allow_chat": True,
            "allow_reactions": True,
            "max_participants": 50,
            "require_approval": False,
        }

    def add_participant(
        self, user_id: str, username: str, avatar: Optional[str] = None
    ) -> bool:
        """Add participant to watch party"""
        if len(self.participants) >= self.settings["max_participants"]:
            return False

        if user_id in self.participants:
            return False

        self.participants[user_id] = {
            "user_id": user_id,
            "username": username,
            "avatar": avatar,
            "joined_at": datetime.now().isoformat(),
            "is_host": user_id == self.host_id,
            "is_ready": False,
        }

        logger.info(f"👥 {username} joined party {self.party_id}")
        return True

    def remove_participant(self, user_id: str):
        """Remove participant from watch party"""
        if user_id in self.participants:
            username = self.participants[user_id]["username"]
            del self.participants[user_id]
            logger.info(f"👋 {username} left party {self.party_id}")

    def set_playback_state(
        self,
        user_id: str,
        is_playing: bool,
        current_time: float,
        playback_rate: float = 1.0,
    ) -> Dict:
        """Update playback state (host only by default)"""
        if self.settings["host_only_controls"] and user_id != self.host_id:
            return {"success": False, "error": "Only host can control playback"}

        self.is_playing = is_playing
        self.current_time = current_time
        self.playback_rate = playback_rate
        self.last_sync_time = datetime.now()

        action = "played" if is_playing else "paused"
        logger.info(f"▶️ Party {self.party_id} {action} at {current_time:.1f}s")

        return {"success": True, "state": self.get_sync_state()}

    def seek_to(self, user_id: str, time: float) -> Dict:
        """Seek to specific time"""
        if self.settings["host_only_controls"] and user_id != self.host_id:
            return {"success": False, "error": "Only host can seek"}

        self.current_time = time
        self.last_sync_time = datetime.now()

        logger.info(f"⏩ Party {self.party_id} seeked to {time:.1f}s")

        return {"success": True, "state": self.get_sync_state()}

    def get_sync_state(self) -> Dict:
        """Get current synchronization state"""
        # Calculate current time accounting for playback since last update
        if self.is_playing:
            elapsed = (datetime.now() - self.last_sync_time).total_seconds()
            adjusted_time = self.current_time + (elapsed * self.playback_rate)
        else:
            adjusted_time = self.current_time

        return {
            "is_playing": self.is_playing,
            "current_time": adjusted_time,
            "playback_rate": self.playback_rate,
            "last_sync": self.last_sync_time.isoformat(),
        }

    def add_message(
        self, user_id: str, message: str, timestamp: Optional[float] = None
    ) -> Dict:
        """Add chat message"""
        if not self.settings["allow_chat"]:
            return {"success": False, "error": "Chat is disabled"}

        if user_id not in self.participants:
            return {"success": False, "error": "User not in party"}

        msg = {
            "message_id": str(uuid.uuid4()),
            "user_id": user_id,
            "username": self.participants[user_id]["username"],
            "message": message,
            "video_timestamp": timestamp or self.current_time,
            "sent_at": datetime.now().isoformat(),
        }

        self.messages.append(msg)

        # Trim old messages
        if len(self.messages) > self.max_messages:
            self.messages = self.messages[-self.max_messages :]

        return {"success": True, "message": msg}

    def add_reaction(
        self, user_id: str, emoji: str, timestamp: Optional[float] = None
    ) -> Dict:
        """Add reaction emoji at current timestamp"""
        if not self.settings["allow_reactions"]:
            return {"success": False, "error": "Reactions are disabled"}

        if user_id not in self.participants:
            return {"success": False, "error": "User not in party"}

        time_key = str(int(timestamp or self.current_time))

        if time_key not in self.active_reactions:
            self.active_reactions[time_key] = []

        reaction = {
            "user_id": user_id,
            "username": self.participants[user_id]["username"],
            "emoji": emoji,
            "timestamp": float(time_key),
            "created_at": datetime.now().isoformat(),
        }

        self.active_reactions[time_key].append(reaction)

        return {"success": True, "reaction": reaction}

    def get_reactions_at_time(
        self, timestamp: float, window: float = 2.0
    ) -> List[Dict]:
        """Get reactions near a specific timestamp"""
        reactions = []

        for time_key, reaction_list in self.active_reactions.items():
            time_val = float(time_key)
            if abs(time_val - timestamp) <= window:
                reactions.extend(reaction_list)

        return reactions

    def to_dict(self) -> Dict:
        """Convert party state to dictionary"""
        return {
            "party_id": self.party_id,
            "host_id": self.host_id,
            "video_id": self.video_id,
            "created_at": self.created_at.isoformat(),
            "participants": list(self.participants.values()),
            "participant_count": len(self.participants),
            "playback_state": self.get_sync_state(),
            "settings": self.settings,
            "recent_messages": self.messages[-50:],  # Last 50 messages
            "message_count": len(self.messages),
        }


class WatchPartyManager:
    """
    Manage multiple watch party sessions
    """

    def __init__(self):
        self.parties: Dict[str, WatchParty] = {}
        self.user_parties: Dict[str, Set[str]] = {}  # user_id -> set of party_ids

    def create_party(
        self, host_id: str, video_id: str, settings: Optional[Dict] = None
    ) -> str:
        """Create new watch party"""
        party_id = str(uuid.uuid4())[:8]

        party = WatchParty(party_id, host_id, video_id)

        if settings:
            party.settings.update(settings)

        # Add host as first participant
        party.add_participant(host_id, f"Host-{host_id[:8]}")

        self.parties[party_id] = party

        if host_id not in self.user_parties:
            self.user_parties[host_id] = set()
        self.user_parties[host_id].add(party_id)

        logger.info(f"🎉 Created party {party_id} for video {video_id}")
        return party_id

    def join_party(self, party_id: str, user_id: str, username: str) -> Dict:
        """Join existing watch party"""
        if party_id not in self.parties:
            return {"success": False, "error": "Party not found"}

        party = self.parties[party_id]

        if not party.add_participant(user_id, username):
            return {"success": False, "error": "Cannot join party"}

        if user_id not in self.user_parties:
            self.user_parties[user_id] = set()
        self.user_parties[user_id].add(party_id)

        return {"success": True, "party": party.to_dict()}

    def leave_party(self, party_id: str, user_id: str):
        """Leave watch party"""
        if party_id in self.parties:
            party = self.parties[party_id]
            party.remove_participant(user_id)

            # Remove from user's parties
            if user_id in self.user_parties:
                self.user_parties[user_id].discard(party_id)

            # Delete party if empty
            if len(party.participants) == 0:
                del self.parties[party_id]
                logger.info(f"🗑️ Deleted empty party {party_id}")

    def get_party(self, party_id: str) -> Optional[WatchParty]:
        """Get party by ID"""
        return self.parties.get(party_id)

    def list_user_parties(self, user_id: str) -> List[Dict]:
        """List all parties a user is in"""
        if user_id not in self.user_parties:
            return []

        party_ids = self.user_parties[user_id]
        return [self.parties[pid].to_dict() for pid in party_ids if pid in self.parties]

    def list_all_parties(self) -> List[Dict]:
        """List all active parties"""
        return [party.to_dict() for party in self.parties.values()]


# ============================================================================
# WebSocket Handler (FastAPI/Flask-SocketIO example)
# ============================================================================


class WatchPartyWebSocketHandler:
    """
    WebSocket handler for real-time party events
    """

    def __init__(self):
        self.manager = WatchPartyManager()
        self.connections: Dict[str, Set] = {}  # party_id -> set of websockets

    async def handle_connect(self, websocket, party_id: str, user_id: str):
        """Handle WebSocket connection"""
        if party_id not in self.connections:
            self.connections[party_id] = set()

        self.connections[party_id].add(websocket)

        # Send current party state
        party = self.manager.get_party(party_id)
        if party:
            await self.send_to_user(
                websocket, {"type": "party_state", "data": party.to_dict()}
            )

    async def handle_disconnect(self, websocket, party_id: str, user_id: str):
        """Handle WebSocket disconnection"""
        if party_id in self.connections:
            self.connections[party_id].discard(websocket)

            # Clean up empty connection sets
            if len(self.connections[party_id]) == 0:
                del self.connections[party_id]

        # Remove user from party
        self.manager.leave_party(party_id, user_id)

    async def handle_message(
        self, websocket, party_id: str, user_id: str, message: Dict
    ):
        """Handle incoming WebSocket message"""
        party = self.manager.get_party(party_id)
        if not party:
            return

        msg_type = message.get("type")

        if msg_type == "play":
            result = party.set_playback_state(
                user_id,
                True,
                message.get("currentTime", 0),
                message.get("playbackRate", 1.0),
            )
            await self.broadcast_to_party(
                party_id, {"type": "playback_state", "data": result}
            )

        elif msg_type == "pause":
            result = party.set_playback_state(
                user_id, False, message.get("currentTime", 0)
            )
            await self.broadcast_to_party(
                party_id, {"type": "playback_state", "data": result}
            )

        elif msg_type == "seek":
            result = party.seek_to(user_id, message.get("time", 0))
            await self.broadcast_to_party(party_id, {"type": "seek", "data": result})

        elif msg_type == "chat_message":
            result = party.add_message(
                user_id, message.get("message", ""), message.get("timestamp")
            )
            await self.broadcast_to_party(
                party_id, {"type": "chat_message", "data": result}
            )

        elif msg_type == "reaction":
            result = party.add_reaction(
                user_id, message.get("emoji", "👍"), message.get("timestamp")
            )
            await self.broadcast_to_party(
                party_id, {"type": "reaction", "data": result}
            )

        elif msg_type == "sync_request":
            await self.send_to_user(
                websocket, {"type": "sync_state", "data": party.get_sync_state()}
            )

    async def broadcast_to_party(self, party_id: str, message: Dict):
        """Broadcast message to all users in party"""
        if party_id not in self.connections:
            return

        websockets = list(self.connections[party_id])

        for ws in websockets:
            try:
                await self.send_to_user(ws, message)
            except Exception as e:
                logger.error(f"Error broadcasting to websocket: {e}")

    async def send_to_user(self, websocket, message: Dict):
        """Send message to specific user"""
        await websocket.send_json(message)


# ============================================================================
# Example Usage
# ============================================================================

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("Watch Party & Real-Time Collaboration")
    print("=" * 60)

    # Example: Create and manage watch parties
    manager = WatchPartyManager()

    # Create party
    party_id = manager.create_party(
        host_id="user123",
        video_id="video456",
        settings={"host_only_controls": True, "max_participants": 25},
    )

    print(f"\n🎉 Created party: {party_id}")

    # Join party
    result = manager.join_party(party_id, "user789", "Alice")
    print(f"👥 Alice joined: {result['success']}")

    # Get party
    party = manager.get_party(party_id)
    if party:
        # Add message
        party.add_message("user789", "Hello everyone! 👋")

        # Add reaction
        party.add_reaction("user789", "🎉", timestamp=10.5)

        # Update playback
        party.set_playback_state("user123", True, 15.0)

        print(f"\n📊 Party state:")
        print(f"   Participants: {party.participant_count}")
        print(f"   Messages: {len(party.messages)}")
        print(f"   Playing: {party.is_playing}")
        print(f"   Current time: {party.current_time:.1f}s")

    print("\n✅ Watch party module ready!")
