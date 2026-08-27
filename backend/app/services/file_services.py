from pathlib import Path
import shutil

from app.config import UPLOAD_DIR


def get_upload_directory() -> Path:
    return UPLOAD_DIR


def save_uploaded_file(file, filename: str) -> Path:
    file_path = UPLOAD_DIR / filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path