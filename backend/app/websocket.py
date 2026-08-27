from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections = {}

    async def connect(
        self,
        websocket: WebSocket,
        device_id: str,
        device_name: str,
    ):
        self.active_connections[device_id] = {
            "websocket": websocket,
            "device_name": device_name,
        }

    def disconnect(self, device_id: str):
        self.active_connections.pop(
            device_id,
            None,
        )

    async def send_to_device(
        self,
        device_id: str,
        message: str,
    ):
        connection = self.active_connections.get(
            device_id
        )

        if connection:
            await connection["websocket"].send_text(
                message
            )

    async def broadcast(self, message: str):
        disconnected = []

        for device_id, connection in self.active_connections.items():
            try:
                await connection["websocket"].send_text(
                    message
                )
            except Exception:
                disconnected.append(device_id)

        for device_id in disconnected:
            self.disconnect(device_id)


manager = ConnectionManager()


async def websocket_endpoint(websocket: WebSocket):
    device_id = None

    try:
        # Accept WebSocket connection
        await websocket.accept()

        # Receive device registration
        message = await websocket.receive_json()

        print(
            "Registration message received:",
            message
        )

        device_id = message.get("device_id")
        device_name = message.get("device_name")

        if not device_id:
            await websocket.close(
                code=1008,
                reason="Device ID required",
            )
            return

        if not device_name:
            device_name = "Unknown Device"

        print(
            f"Registering device: "
            f"{device_name} ({device_id})"
        )

        # Register device
        await manager.connect(
            websocket,
            device_id,
            device_name,
        )

        print(
            f"Device connected: "
            f"{device_name} ({device_id})"
        )

        # Notify all connected devices
        await manager.broadcast(
            "device_list_changed"
        )

        # Confirm registration
        await manager.send_to_device(
            device_id,
            "Device registered successfully",
        )

        # Keep connection alive
        while True:
            message = await websocket.receive_text()

            await manager.send_to_device(
                device_id,
                f"Server received: {message}",
            )

    except Exception as error:
        print(
            f"WebSocket connection error: {error}"
        )

        if device_id:
            manager.disconnect(device_id)

            # Notify remaining devices
            await manager.broadcast(
                "device_list_changed"
            )