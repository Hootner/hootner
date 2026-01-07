#!/usr/bin/env python3
import asyncio
import websockets

connected = set()

async def handler(websocket):
    connected.add(websocket)
    print(f"Client connected. Total: {len(connected)}")
    
    try:
        async for message in websocket:
            print(f"Received: {message}")
            
            # Broadcast to all clients
            websockets.broadcast(connected, f"Echo: {message}")
    finally:
        connected.remove(websocket)
        print(f"Client disconnected. Total: {len(connected)}")

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server running on ws://localhost:8765")
        await asyncio.Future()

if __name__ == '__main__':
    asyncio.run(main())
