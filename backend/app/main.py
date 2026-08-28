from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socket
from app.api.files import router as files_router
from app.websocket import websocket_endpoint
from app.api.devices import router as devices_router

app = FastAPI(
    title="Local File Share",
    description="Local network file sharing application",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.36:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Local File Share API is running",
        "status": "online",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }

@app.get("/api/network")
async def network_info():
    hostname = socket.gethostname()

    try:
        # Create a UDP socket to determine the local
        # network interface/IP used by the machine.
        with socket.socket(
            socket.AF_INET,
            socket.SOCK_DGRAM,
        ) as sock:
            sock.connect(("8.8.8.8", 80))
            local_ip = sock.getsockname()[0]

    except OSError:
        local_ip = socket.gethostbyname(hostname)

    return {
        "hostname": hostname,
        "local_ip": local_ip,
        "frontend_url": f"http://{local_ip}:5173",
    }


app.include_router(files_router)
app.include_router(devices_router)
app.websocket("/ws")(websocket_endpoint)