import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from realtime import Optional
from pathlib import Path
from typing import Annotated
from csv_converter import csv_converter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
origins = [
    "http://localhost:5173",  # Default Vite + React port
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],  # Expose Content-Disposition header for file name
)
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend service is running"}

@app.post("/convert")
async def convert_data(
    file: Annotated[Optional[UploadFile], File()] = None,
    raw_text: Annotated[Optional[str], Form()] = None,
):
    """
    Converts uploaded file streams or raw text into a downloadable CSV file.
    """
    try:
        if file and file.filename:
            file_bytes = await file.read()
            file_ext = Path(file.filename).suffix
            output_stream, filename = csv_converter(input_source=file_bytes, file_extension=file_ext)
        elif raw_text:
            output_stream, filename = csv_converter(input_source=raw_text)
        else:
            raise HTTPException(
                status_code=400, 
                detail="No file or raw text provided for conversion."
            )
        return StreamingResponse(
            output_stream,
            media_type="text/csv",
            headers={"Content-Disposition": f"{filename}"} 
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during conversion: {str(e)}")

def remove_file(path: str):
    """Background task to delete temporary file after download."""
    try:
        if os.path.exists(path):
            os.remove(path)
            print(f"Cleaned up temporary file: {path}")
    except Exception as e:
        print(f"Error deleting file {path}: {e}")

@app.get("/download/{filename}")
async def download_file(filename: str):
    """
    Endpoint to download a file from the server.
    """
    file_path = f"{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_path, filename=filename, media_type='text/csv')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
