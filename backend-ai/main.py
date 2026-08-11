import io
import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from realtime import Field, Optional
from pathlib import Path
from typing import Annotated
from csv_converter import csv_converter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from contextlib import asynccontextmanager
from scheduler import start_scheduler, stop_scheduler
from image_to_ocr import extract_date_from_image
from PIL import Image

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs when FastAPI starts up
    start_scheduler()
    yield
    # Runs when FastAPI shuts down
    stop_scheduler()

app = FastAPI(lifespan=lifespan)
origins = [
    "http://localhost:5173",  # Default Vite + React port
    "http://127.0.0.1:5173",  # Default Vite + React port
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


@app.post("/extract-data")
async def extract_data(file: UploadFile = File()):
    """
    Extracts structured data from raw text using OpenAI's API.

    Args:
        file (UploadFile): The uploaded image file.

    Returns:
        dict: A dictionary containing the extracted data.
    """
    try:
        file_bytes = await file.read()
        image = io.BytesIO(file_bytes)
        extracted_data = extract_date_from_image(image)
        return image

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data extraction failed: {str(e)}")

# class EmailPayload(BaseModel):
#     expiring_licences: list[dict]
#     to_address: str
#     subject: str = Field(..., max_length=200)

# @app.post("/send-email")
# async def send_email_endpoint(payload: EmailPayload, background_tasks: BackgroundTasks):
#     try:
#             f'<li>{guard["name"]} ({guard["hkid"]})</li>'
#             for guard in payload.expiring_licences
#         )

#         html_message = f"Following guards need renewal:<ul>{items}</ul>"
#         background_tasks.add_task(
#             send_email(to_address=payload.to_address,
#             subject=payload.subject,
#             message=html_message)
#         )
#         return JSONResponse(status_code=200, content={"message": "Email sent successfully"})
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
