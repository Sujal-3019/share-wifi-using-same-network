from pathlib import Path
import sys


def get_app_directory() -> Path:
    """
    Returns the directory where the application is running.

    During normal development:
        backend/

    When running as a PyInstaller executable:
        directory containing LocalShare.exe
    """
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent

    return Path(__file__).resolve().parent.parent


APP_DIR = get_app_directory()

STORAGE_DIR = APP_DIR / "storage"
UPLOAD_DIR = STORAGE_DIR / "uploads"
METADATA_FILE = STORAGE_DIR / "metadata.json"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)