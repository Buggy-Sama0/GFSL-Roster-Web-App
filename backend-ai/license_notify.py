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
    threshold = today + timedelta(days=60)
    notify_guards = []
    for licence in LICENSES:
        expired_response = supabase.table("employees").select(f"name, hkid").lt(licence, today.isoformat()).execute()
        expiring_response = supabase.table("employees").select(f"name, hkid").gte(licence, today.isoformat()).lte(licence, threshold.isoformat()).execute()
        if len(expired_response.data) > 0:
            for employee in expired_response.data:
                notify_guards.append({ "name": employee['name'], "hkid": employee['hkid'], "license": licence, "status": "expired" })
                # print(f"Name: {employee['name']}, {licence} expired.")
        if len(expiring_response.data) > 0:
            for employee in expiring_response.data:
                notify_guards.append({ "name": employee['name'], "hkid": employee['hkid'], "license": licence, "status": "expiring_soon" })
                # print(f"Name: {employee['name']}, {licence} expiring within 60 days.")
    if notify_guards is None or len(notify_guards) == 0:
        print("No guards with licenses expiring within 60 days or expired.")
        return None

    return notify_guards

def get_email_notification():
    records = check_expiring_licenses()
    if records is None or len(records) == 0:
        print("No expiring licenses or expired licenses found. So no email notification will be sent.")
        return

    expired_records = [guard for guard in records if guard["status"] == "expired"]
    expiring_records = [guard for guard in records if guard["status"] == "expiring_soon"]

    item1 = "".join(
            f'<li><strong>{guard["name"]}</strong> of HKID <strong>{guard["hkid"]}</strong> - <strong>{guard["license"]}</strong> expired.</li>'
            for guard in expired_records
        )

    item2 = "".join(
            f'<li><strong>{guard["name"]}</strong> of HKID <strong>{guard["hkid"]}</strong> - <strong>{guard["license"]}</strong> expiring within 60 days.</li>'
            for guard in expiring_records
        )

    html_message = f"Following guards need renewal:<ul>{item1}{item2}</ul>"
    send_email(
        to_address='gurkha.forces@gmail.com',
        # to_addres='limbuc489@gmail.com',
        subject='Urgent License Renewal Reminder',
        message=html_message
    )





    
    


