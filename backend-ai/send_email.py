import os
from dotenv import load_dotenv
import resend

# Load environment variables
load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

def send_email(to_address: str, subject: str, message: str):
    params: resend.Emails.SendParams = {
        "from": "Gurkha Portal <gurkha.forces@gurkhahk.site>",
        "to": [to_address],
        "subject": subject,
        "html": message,
    }

    email = resend.Emails.send(params)
    return email
