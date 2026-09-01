from fastapi import FastAPI
import uvicorn
import threading
import webbrowser
from fastapi.middleware.cors import CORSMiddleware
import socket
from app.api.files import router as files_router
from app.websocket import websocket_endpoint
from app.api.devices import router as devices_router
from pathlib import Path
import sys
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

def get_resource_directory() -> Path:
    """
    Returns the directory containing bundled application resources.
    """
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)

    return Path(__file__).resolve().parents[2]


RESOURCE_DIR = get_resource_directory()

FRONTEND_DIST = RESOURCE_DIR / "frontend" / "dist"

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
        "frontend_url": f"http://{local_ip}:8000",
    }


app.include_router(files_router)
app.include_router(devices_router)
app.websocket("/ws")(websocket_endpoint)

if FRONTEND_DIST.exists():
    app.mount(
        "/assets",
        StaticFiles(
            directory=FRONTEND_DIST / "assets"
        ),
        name="assets",
    )

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    requested_file = FRONTEND_DIST / full_path

    if (
        full_path
        and requested_file.exists()
        and requested_file.is_file()
    ):
        return FileResponse(requested_file)

    return FileResponse(
        FRONTEND_DIST / "index.html"
    )

if __name__ == "__main__":
    def open_browser():
        webbrowser.open("http://localhost:8000")

    threading.Timer(
        1.5,
        open_browser
    ).start()

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
    )