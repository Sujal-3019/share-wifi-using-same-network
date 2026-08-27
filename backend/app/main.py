from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


app.include_router(files_router)
app.include_router(devices_router)
app.websocket("/ws")(websocket_endpoint)