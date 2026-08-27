from fastapi import APIRouter

from app.websocket import manager


router = APIRouter(
    prefix="/api/devices",
    tags=["devices"],
)


@router.get("")
async def get_devices():
    devices = []

    for device_id, connection in manager.active_connections.items():
        devices.append({
            "device_id": device_id,
            "device_name": connection["device_name"],
        })

    return {
        "devices": devices
    }