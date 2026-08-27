from fastapi import APIRouter, File, UploadFile

from app.services.file_services import (
    get_upload_directory,
    save_uploaded_file,
)


router = APIRouter(
    prefix="/api/files",
    tags=["Files"],
)


@router.get("/status")
async def files_status():
    upload_directory = get_upload_directory()

    return {
        "status": "ready",
        "upload_directory": str(upload_directory),
    }


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    result = save_uploaded_file(
        file,
        file.filename,
    )

    return {
        "message": "File uploaded successfully",
        **result,
    }