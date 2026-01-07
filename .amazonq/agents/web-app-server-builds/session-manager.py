#!/usr/bin/env python3
import uuid
import time

class SessionManager:
    def __init__(self, timeout=3600):
        self.sessions = {}
        self.timeout = timeout
    
    def create(self, data=None):
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            'data': data or {},
            'created': time.time(),
            'last_access': time.time()
        }
        return session_id
    
    def get(self, session_id):
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        if time.time() - session['last_access'] > self.timeout:
            del self.sessions[session_id]
            return None
        
        session['last_access'] = time.time()
        return session['data']
    
    def set(self, session_id, key, value):
        if session_id in self.sessions:
            self.sessions[session_id]['data'][key] = value
            self.sessions[session_id]['last_access'] = time.time()
    
    def destroy(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def cleanup(self):
        now = time.time()
        expired = [sid for sid, s in self.sessions.items() 
                   if now - s['last_access'] > self.timeout]
        for sid in expired:
            del self.sessions[sid]
        return len(expired)

# Test
manager = SessionManager(timeout=60)
sid = manager.create({'user': 'Alice'})
print(f"Session created: {sid}")
print(f"Session data: {manager.get(sid)}")
manager.set(sid, 'cart', ['item1', 'item2'])
print(f"Updated data: {manager.get(sid)}")
