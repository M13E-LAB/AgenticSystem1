"""
🔌 WebSocket Manager - Real-time communication with frontend

Manages WebSocket connections and broadcasts updates to connected clients.
"""

from fastapi import WebSocket
from typing import Dict, List
import json


class WebSocketManager:
    """Manager for WebSocket connections"""
    
    def __init__(self):
        # Store active connections by research_id
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, research_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        
        if research_id not in self.active_connections:
            self.active_connections[research_id] = []
        
        self.active_connections[research_id].append(websocket)
        print(f"✅ WebSocket connected for research: {research_id}")
    
    def disconnect(self, websocket: WebSocket, research_id: str):
        """Remove a WebSocket connection"""
        if research_id in self.active_connections:
            try:
                self.active_connections[research_id].remove(websocket)
            except ValueError:
                # Already removed, ignore
                pass
            
            # Clean up empty lists
            if not self.active_connections[research_id]:
                del self.active_connections[research_id]
        
        print(f"❌ WebSocket disconnected for research: {research_id}")
    
    async def send_update(self, research_id: str, message: dict):
        """Send update to all connected clients for a research"""
        if research_id in self.active_connections:
            # Send to all connected clients (make a copy to avoid modification during iteration)
            failed_connections = []
            
            for connection in self.active_connections[research_id][:]:  # Copy the list
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"⚠️ Error sending message: {e}")
                    failed_connections.append(connection)
            
            # Remove failed connections after iteration
            for connection in failed_connections:
                try:
                    self.disconnect(connection, research_id)
                except:
                    pass  # Already removed
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for research_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting: {e}")

