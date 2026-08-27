from pathlib import Path
from uuid import uuid4
import shutil

from app.config import UPLOAD_DIR


def get_upload_directory() -> Path:
    return UPLOAD_DIR


def save_uploaded_file(file, original_filename: str) -> dict:
    # Get only the filename, removing any directory information
    safe_filename = Path(original_filename).name

    # Generate a unique ID for the stored file
    file_id = uuid4().hex

    # Keep the original extension
    extension = Path(safe_filename).suffix

    # Create a unique stored filename
    stored_filename = f"{file_id}{extension}"

    file_path = UPLOAD_DIR / stored_filename

    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "file_id": file_id,
        "original_filename": safe_filename,
        "stored_filename": stored_filename,
        "size": file_path.stat().st_size,
        "path": str(file_path),
    }