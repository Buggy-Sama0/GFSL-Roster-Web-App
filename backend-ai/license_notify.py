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

LICENSES = ["cwr_expiry_date", "green_card_expiry_date", "spp_expiry_date"]

def check_expiring_licenses():
    """
    Checks for expiring licenses and returns a list of guards with licenses expiring within 30 days.
    """
    today = date.today()
    threshold = today + timedelta(days=30)
    notify_guards = []
    for licence in LICENSES:
        response = supabase.table("employees").select(f"name, hkid").gte(licence, today.isoformat()).lte(licence, threshold.isoformat()).execute()
        employees = response.data
        if len(employees) > 0:
            for employee in employees:
                notify_guards.append({ "name": employee['name'], "hkid": employee['hkid'], "license": licence})
                # print(f"Name: {employee['name']}, {licence} expiring within 30 days.")
            # print(f"Found {len(employees)} records with {licence} expiring within 30 days.")
    if notify_guards is None or len(notify_guards) == 0:
        print("No guards with licenses expiring within 30 days.")
        return None

    return notify_guards

def get_email_notification():
    records = check_expiring_licenses()
    if records is None or len(records) == 0:
        print("No expiring licenses found. So no email notification will be sent.")
        return

    items = "".join(
            f'<li><strong>{guard["name"]}</strong> of HKID <strong>{guard["hkid"]}</strong> - <strong>{guard["license"]}</strong> expiring within 30 days.</li>'
            for guard in records
        )

    html_message = f"Following guards need renewal:<ul>{items}</ul>"
    send_email(
        to_address='limbuc489@gmail.com',
        subject='Urgent License Renewal Reminder',
        message=html_message
    )





    
    


