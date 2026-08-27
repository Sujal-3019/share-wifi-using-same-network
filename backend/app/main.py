from fastapi import FastAPI

app = FastAPI(
    title="Local File Share",
    description="Local network file sharing application",
    version="0.1.0",
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