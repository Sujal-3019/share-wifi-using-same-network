from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.services.file_services import (
    get_upload_directory,
    save_uploaded_file,
    list_uploaded_files,
    get_file_for_download,
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

@router.get("")
async def list_files():
    return {
        "files": list_uploaded_files()
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

@router.get("/{file_id}/download")
async def download_file(file_id: str):
    result = get_file_for_download(file_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="File not found",
        )

    file_path, file_info = result

    return FileResponse(
        path=file_path,
        filename=file_info["original_filename"],
        media_type="application/octet-stream",
    )