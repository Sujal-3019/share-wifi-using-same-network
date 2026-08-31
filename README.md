# LocalShare

A fast, privacy-friendly **local file-sharing web application** built with **FastAPI and React** that allows devices connected to the same Wi-Fi network to transfer files directly between each other.

LocalShare runs a FastAPI server on one device, typically a laptop, and provides a responsive React web interface that other devices can access through the laptop's local IP address.

No cloud storage is required for file transfers.

---

## Features

* 📤 **Phone → Laptop file upload**
* 📥 **Laptop → Phone file download**
* 📁 **Multiple-file selection and upload**
* 📊 **Real-time upload progress**
* 📊 **Download progress on supported browsers**
* 💻 **Multiple connected devices**
* 🟢 **Real-time device online/offline status**
* 🎯 **Select a target device before sending files**
* 🔔 **Real-time incoming file notifications**
* 🔐 **Recipient-aware file listing**
* 🔐 **Recipient-aware file downloads**
* 🆔 **Unique device IDs**
* 💾 **Local filesystem storage**
* 🗂️ **Metadata storage using JSON**
* 🔲 **QR code for quickly opening LocalShare on another device**
* 🌐 **LAN-based communication**
* 🌓 **Dark/Light theme toggle**
* ✨ **Modern glassmorphism UI**
* 📱 **Responsive mobile-friendly interface**
* ☁️ **No cloud storage**
* 🌍 **No internet connection required for file transfer once devices are on the same local network**

---

## How It Works

LocalShare uses the laptop as the local server.

```text
                    Same Wi-Fi / LAN
               ┌──────────────────────┐
               │                      │
            📱 Phone              💻 Laptop
               │                      │
               │ HTTP / WebSocket    │
               └──────────┬───────────┘
                          │
                   FastAPI Server
                          │
                  ┌───────┴───────┐
                  │               │
             File System     WebSocket
                  │               │
             📁 Uploads      Device Status
                  │               │
             metadata.json   Real-time Events
```

The laptop runs:

```text
FastAPI + Uvicorn
React + Vite
```

A phone connected to the same Wi-Fi can open the application using the laptop's local IP:

```text
http://192.168.x.x:5173
```

Files are transferred directly through the local network.

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* Web APIs
* WebSocket client
* `qrcode.react`

### Backend

* Python
* FastAPI
* Uvicorn
* WebSockets
* `python-multipart`

### Storage

* Local filesystem
* JSON metadata file

### Database

No database is currently required.

---

## Project Structure

```text
local-file-share/
│
├── backend/
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── websocket.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── files.py
│   │   │   └── devices.py
│   │   │
│   │   └── services/
│   │       ├── __init__.py
│   │       └── file_services.py
│   │
│   ├── storage/
│   │   ├── uploads/
│   │   └── metadata.json
│   │
│   ├── venv/
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeviceList.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── FilePicker.jsx
│   │   │   ├── IncomingFile.jsx
│   │   │   ├── QRCodeShare.jsx
│   │   │   └── ThemeToggle.jsx
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── device.js
│   │   │
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
└── README.md
```

---

## Application Flow

### Connecting a Device

1. Start the FastAPI backend on the laptop.
2. Start the React development server.
3. Make sure the phone and laptop are connected to the same Wi-Fi network.
4. Open the LocalShare URL from another device.
5. The browser establishes a WebSocket connection.
6. The device registers itself with a generated device ID.
7. The device appears in the **Devices on Network** section.

---

## QR Code Connection

LocalShare provides a QR code that contains the laptop's local React URL.

Example:

```text
http://192.168.1.36:5173
```

A user can scan the QR code using a phone camera and immediately open LocalShare.

```text
💻 Laptop
    │
    │ Generate QR
    ▼
┌──────────────┐
│   QR CODE    │
└──────────────┘
    │
    │ Scan
    ▼
📱 Phone
    │
    ▼
http://192.168.1.36:5173
```

The QR code is only a connection shortcut. It does not contain authentication credentials.

---

## Device Management

Each browser/device receives a locally generated device ID.

The device ID is stored in browser `localStorage` so that refreshing the page does not create a new identity.

Example:

```text
device_id:
31d8244d-06e3-4ced-93ca-e0b70b82a35d
```

Devices connected through WebSockets are maintained by the backend's `ConnectionManager`.

Example:

```text
🟢 Devices on Network

💻 Windows PC
   Connected

📱 Android Phone
   Connected
```

The application automatically updates the device list when a device connects or disconnects.

---

## Device Selection

Before sending a file, the sender selects the destination device.

Example:

```text
Devices on Network

💻 Windows PC
📱 Android Phone  ✓ Selected
📱 Tablet
```

The sender's own device is excluded from the selectable device list.

The selected device's ID is sent along with the file upload.

---

## File Upload Flow

The upload process works through HTTP.

```text
📱 Sender
   │
   │ Select files
   ▼
React
   │
   │ multipart/form-data
   ▼
POST /api/files/upload
   │
   ▼
FastAPI
   │
   ├── Generate unique file ID
   ├── Sanitize filename
   ├── Save file locally
   ├── Store metadata
   └── Notify target device
```

Files are uploaded sequentially.

Example:

```text
photo.jpg
    ↓
uploaded

video.mp4
    ↓
uploaded

document.pdf
    ↓
uploaded
```

---

## Upload Progress

File uploads use `XMLHttpRequest` so the browser can report actual upload progress.

Example:

```text
video.mp4

██████████████░░░░░░ 72%

72 MB / 100 MB
```

For multiple files, every file maintains its own state:

```text
photo.jpg
████████████████████ 100% ✓

video.mp4
██████████░░░░░░░░░░ 57%

document.pdf
Waiting...
```

---

## File Storage

Uploaded files are stored in:

```text
backend/storage/uploads/
```

The actual filesystem filename is generated using a UUID.

For example:

```text
Original filename:

IMG_1234.jpg
```

Stored as:

```text
8f42a7c91b4a4c4b8d....jpg
```

This prevents simple filename collisions and avoids directly trusting user-provided filenames for filesystem paths.

---

## Metadata Storage

File metadata is stored in:

```text
backend/storage/metadata.json
```

Example:

```json
[
  {
    "file_id": "8f42a7c91b4a4c4b8d...",
    "original_filename": "IMG_1234.jpg",
    "stored_filename": "8f42a7c91b4a4c4b8d....jpg",
    "size": 245678,
    "target_device_id": "42417ad2-9bb5-4227-aa83-094630599de4"
  }
]
```

The metadata separates the user-facing filename from the actual filesystem filename.

---

## Recipient-Aware Files

LocalShare associates uploaded files with the selected target device.

For example:

```text
photo.jpg   → Phone A
video.mp4   → Phone B
report.pdf  → Tablet
```

Phone A sees:

```text
photo.jpg
```

Phone B sees:

```text
video.mp4
```

The devices do not see files that were shared with other devices.

This provides recipient-level file separation without requiring a database.

---

## Incoming File Notifications

When a file is uploaded for a connected device, FastAPI sends a WebSocket event to the target device.

Example event:

```json
{
  "type": "file_available",
  "file": {
    "file_id": "8f42...",
    "filename": "photo.jpg",
    "size": 245678
  }
}
```

The recipient sees an incoming notification without refreshing the page.

Example:

```text
┌─────────────────────────────────┐
│ 📥 New File                     │
│                                 │
│ photo.jpg                       │
│ 2.4 MB                          │
│                                 │
│ [ ↓ Download ]    [ Dismiss ]   │
└─────────────────────────────────┘
```

After downloading, the notification disappears.

---

## File Download Flow

Downloads also use HTTP.

```text
📱 Recipient
      │
      │ Request file
      ▼
FastAPI
      │
      ▼
Local filesystem
      │
      ▼
FileResponse
      │
      ▼
📱 Browser
```

The original filename is preserved when the browser downloads the file.

---

## Download Progress

Downloads use `XMLHttpRequest` and Blob handling so progress can be tracked.

Example:

```text
video.mp4

████████████████░░░░ 82%

82 MB / 100 MB
```

Desktop browsers provide the most reliable visible progress experience. Mobile browsers may handle the browser's native save/download UI differently even though progress events can still be received by the application.

---

## WebSocket Architecture

WebSockets are used for real-time events, not for transferring the actual file bytes.

### HTTP is used for:

* File uploads
* File downloads
* File listing
* Device listing

### WebSockets are used for:

* Device connection
* Device disconnection
* Device registration
* Device list updates
* Incoming file notifications
* Real-time application events

Architecture:

```text
                 FastAPI
              /           \
             /             \
          HTTP           WebSocket
           │                 │
           ▼                 ▼
     File Transfer      Real-time Events
```

---

## Connection Manager

The backend maintains active WebSocket connections using a `ConnectionManager`.

Conceptually:

```text
ConnectionManager

├── device_id_1
│   ├── websocket
│   └── device_name
│
├── device_id_2
│   ├── websocket
│   └── device_name
│
└── device_id_3
    ├── websocket
    └── device_name
```

This makes the application capable of supporting multiple connected devices.

---

## Theme System

The frontend supports:

* 🌙 Dark mode
* ☀️ Light mode

The selected theme is stored in browser `localStorage`.

```text
User selects Light
       ↓
Theme stored locally
       ↓
Refresh page
       ↓
Light theme remains active
```

The UI uses a glassmorphism design system with:

* Transparent surfaces
* Backdrop blur
* Soft borders
* Subtle shadows
* Gradient background lighting
* Rounded cards
* Responsive layouts

---

## Network Requirements

LocalShare requires devices to be reachable over the same local network.

Typical setup:

```text
Laptop:
192.168.1.36

Phone:
192.168.1.14
```

Both devices should be connected to the same Wi-Fi network.

If the phone cannot connect:

* Verify both devices are on the same Wi-Fi.
* Verify FastAPI is running with `--host 0.0.0.0`.
* Check Windows Firewall.
* Verify the laptop's current IPv4 address.
* Make sure the router does not enable client/device isolation.

---

# Installation

## Prerequisites

Install:

* Python 3.10+
* Node.js 18+
* npm
* A modern web browser
* Laptop and phone connected to the same Wi-Fi network

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If you do not have `requirements.txt` yet:

```bash
pip install fastapi uvicorn[standard] python-multipart
```

---

## Frontend Setup

Open a second terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

---

## Environment Configuration

Create:

```text
frontend/.env
```

and configure:

```env
VITE_API_URL=http://YOUR_LAPTOP_IP:8000
```

Example:

```env
VITE_API_URL=http://192.168.1.36:8000
```

Replace the IP address with the laptop's current local IPv4 address.

---

# Running the Application

## Start the Backend

From:

```text
backend/
```

run:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The backend will be available at:

```text
http://localhost:8000
```

or over the LAN:

```text
http://YOUR_LAPTOP_IP:8000
```

Example:

```text
http://192.168.1.36:8000
```

---

## Start the Frontend

From:

```text
frontend/
```

run:

```bash
npm run dev -- --host 0.0.0.0
```

Vite will show a network address similar to:

```text
http://192.168.1.36:5173
```

Open this URL on your laptop and phone.

---

# API Documentation

FastAPI automatically provides interactive documentation at:

```text
http://localhost:8000/docs
```

For LAN access:

```text
http://YOUR_LAPTOP_IP:8000/docs
```

Example:

```text
http://192.168.1.36:8000/docs
```

The project uses API endpoints internally for:

* Health checking
* Device discovery
* File upload
* File listing
* File download
* Network information

---

# Data Flow

## Phone → Laptop

```text
📱 Phone
   │
   │ Select files
   ▼
React
   │
   │ Upload request
   ▼
FastAPI
   │
   ▼
storage/uploads/
   │
   ▼
metadata.json
```

## Laptop → Phone

```text
💻 Laptop
   │
   │ Select target phone
   ▼
React
   │
   │ Upload + target device ID
   ▼
FastAPI
   │
   ├── Save file
   ├── Save metadata
   └── WebSocket notification
          │
          ▼
      📱 Phone
          │
          ▼
      Download file
```

---

# Security and Privacy Model

LocalShare is designed as a local-network application.

Files are stored on the machine running the FastAPI server.

There is no cloud upload service involved in the current architecture.

The application uses:

* UUID-based stored filenames
* Filename sanitization
* Recipient-aware file filtering
* Recipient-aware download access
* WebSocket-based device identity
* Local network communication

The current version intentionally does **not** implement user accounts, passwords, QR authentication tokens, or cloud authentication.

The QR code is only used as a convenient way to open the LocalShare frontend URL.

For use on untrusted networks, additional authentication and encryption should be added before treating the application as a hardened security-sensitive file-sharing service.

---

# Troubleshooting

## Phone cannot open the application

Check:

```bash
ipconfig
```

Find the laptop's Wi-Fi IPv4 address.

Then open:

```text
http://YOUR_LAPTOP_IP:5173
```

from the phone.

---

## FastAPI works on the laptop but not the phone

Make sure the backend is started with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

not only:

```bash
uvicorn app.main:app
```

---

## Frontend cannot communicate with FastAPI

Check:

```env
VITE_API_URL=http://YOUR_LAPTOP_IP:8000
```

Do not use:

```env
VITE_API_URL=http://localhost:8000
```

when testing from a phone.

After changing `.env`, restart Vite.

---

## CORS errors

Make sure the FastAPI application allows the frontend origin.

Example:

```python
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
```

Update the LAN IP if the laptop's address changes.

---

## Device does not appear

Make sure the LocalShare frontend is open on the device.

Device registration occurs through the WebSocket connection.

The expected flow is:

```text
Open LocalShare
      ↓
WebSocket connects
      ↓
Device registers
      ↓
Device appears in Devices on Network
```

---

## Upload fails

Check:

```text
FastAPI terminal
```

and verify the request reaches:

```text
POST /api/files/upload
```

Also verify:

```text
backend/storage/uploads/
```

exists and is writable.

---

# Development Roadmap

The project currently supports the core local file-sharing workflow.

Future improvements can include:

### Planned / Possible Improvements

* 🔄 Resume interrupted transfers
* ❌ Cancel active transfers
* ⚡ Parallel file uploads
* ⚡ Transfer speed calculation
* ⏱️ ETA calculation
* 📜 Transfer history
* 🗑️ Delete received files
* 🧹 Automatic cleanup of old files
* 🗂️ Configurable storage/download directory
* 🔍 Better file search and filtering
* 📱 Improved device-type detection
* 🔔 More detailed transfer notifications
* 🌐 Automatic local-network discovery
* 🖥️ Desktop application packaging
* 🔒 Optional authentication for untrusted networks
* 🔐 HTTPS/WSS support
* 📦 Resume support for very large files

---

# Project Status

```text
LocalShare
│
├── FastAPI backend                 ✅
├── React frontend                  ✅
├── LAN connectivity                ✅
├── Single-file upload              ✅
├── Multiple-file upload            ✅
├── Upload progress                 ✅
├── File metadata                   ✅
├── File listing                    ✅
├── File download                   ✅
├── Download progress               ✅
├── Multiple devices                ✅
├── Device identity                 ✅
├── WebSocket connection            ✅
├── Real-time device presence       ✅
├── Device selection                ✅
├── Target-device uploads           ✅
├── Incoming file notifications     ✅
├── Recipient-aware file listing    ✅
├── Recipient-aware downloads       ✅
├── QR URL connection               ✅
├── Light/Dark theme                ✅
├── Glassmorphism UI                ✅
│
└── Advanced transfer features      🚧
```

---

# License

This project is currently intended for personal, educational, and development use.

MIT License

---

# Author
Sujal Shukla

**LocalShare**

A local-first file-sharing application built with:

```text
React + Vite + Tailwind CSS
FastAPI + Uvicorn
WebSockets
Local Filesystem
```

---
