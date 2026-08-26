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

def send_license_expiry_reminders():
    records = check_expiring_licenses()
    if not records or len(records) == 0:
        print("No expiring licenses or expired licenses found. So no email notification will be sent.")
        return

    expired_records = [guard for guard in records if guard["status"] == "expired"]
    expiring_records = [guard for guard in records if guard["status"] == "expiring_soon"]

    # Expired Table Rows
    item1 = "".join(
        f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 600; color: #1e293b;">{g['name']}</td>
          <td style="padding: 12px; color: #475569; font-family: monospace; font-size: 13px;">{g['hkid']}</td>
          <td style="padding: 12px; color: #475569;">{g['license']}</td>
          <td style="padding: 12px;">
            <span style="background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">EXPIRED</span>
          </td>
        </tr>
        """
        for g in expired_records
    )

    # Expiring Soon Table Rows
    item2 = "".join(
        f"""
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: 600; color: #1e293b;">{g['name']}</td>
          <td style="padding: 12px; color: #475569; font-family: monospace; font-size: 13px;">{g['hkid']}</td>
          <td style="padding: 12px; color: #475569;">{g['license']}</td>
          <td style="padding: 12px;">
            <span style="background-color: #fffbeb; color: #d97706; border: 1px solid #fde68a; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">WITHIN 60 DAYS</span>
          </td>
        </tr>
        """
        for g in expiring_records
    )

    all_rows = item1 + item2

    # HTML Email Template
    html_message = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background-color: #1e293b; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.025em;">Guard License Compliance Alert</h2>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8;">Roster Security Operations • Action Required</p>
          </div>

          <!-- Body -->
          <div style="padding: 24px;">
            <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #475569;">
              Attention required for <strong>{len(records)} security personnel</strong> with expired or upcoming license renewals. Unlicensed deployment poses compliance risks under regional regulations.
            </p>

            <!-- Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
              <thead>
                <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 10px 12px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase;">Guard Name</th>
                  <th style="padding: 10px 12px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase;">HKID</th>
                  <th style="padding: 10px 12px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase;">License Type</th>
                  <th style="padding: 10px 12px; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase;">Status</th>
                </tr>
              </thead>
              <tbody>
                {all_rows}
              </tbody>
            </table>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated operational compliance notice generated by the Diddy Party.
          </div>
        </div>
      </body>
    </html>
    """
    send_email(
        to_address='gurkha.forces@gmail.com',
        # to_address='limbuc489@gmail.com',
        subject='Urgent License Renewal Reminder',
        message=html_message
    )





    
    


