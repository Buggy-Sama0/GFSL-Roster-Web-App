from supabase import create_client
import os
from dotenv import load_dotenv
from datetime import timedelta, date
from send_email import send_email

load_dotenv()

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SECRET_KEY")
)


