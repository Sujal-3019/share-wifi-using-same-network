from pathlib import Path
from uuid import uuid4
import json
import shutil

from app.config import (
    METADATA_FILE,
    UPLOAD_DIR,
)


def get_upload_directory() -> Path:
    return UPLOAD_DIR


def load_metadata() -> list[dict]:
    if not METADATA_FILE.exists():
        return []

    try:
        with METADATA_FILE.open(
            "r",
            encoding="utf-8",
        ) as file:
            return json.load(file)

    except (json.JSONDecodeError, OSError):
        return []


def save_metadata(metadata: list[dict]) -> None:
    with METADATA_FILE.open(
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            metadata,
            file,
            indent=2,
        )


def save_uploaded_file(file, original_filename: str) -> dict:
    safe_filename = Path(original_filename).name

    file_id = uuid4().hex
    extension = Path(safe_filename).suffix

    stored_filename = f"{file_id}{extension}"

    file_path = UPLOAD_DIR / stored_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = file_path.stat().st_size

    file_info = {
        "file_id": file_id,
        "original_filename": safe_filename,
        "stored_filename": stored_filename,
        "size": file_size,
    }

    metadata = load_metadata()
    metadata.append(file_info)

    save_metadata(metadata)

    return {
        **file_info,
        "path": str(file_path),
    }


def list_uploaded_files() -> list[dict]:
    metadata = load_metadata()

    files = []

    for file_info in metadata:
        file_path = UPLOAD_DIR / file_info["stored_filename"]

        if not file_path.exists():
            continue

        files.append({
            "file_id": file_info["file_id"],
            "filename": file_info["original_filename"],
            "size": file_path.stat().st_size,
        })

    return files

def get_file_for_download(file_id: str) -> tuple[Path, dict] | None:
    metadata = load_metadata()

    for file_info in metadata:
        if file_info["file_id"] != file_id:
            continue

        file_path = UPLOAD_DIR / file_info["stored_filename"]

        if not file_path.exists() or not file_path.is_file():
            return None

        return file_path, file_info

    return None