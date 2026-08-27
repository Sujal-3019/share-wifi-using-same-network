from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

STORAGE_DIR = BASE_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)