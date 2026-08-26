from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from license_notify import send_license_expiry_reminders 
from contract_end_notify import send_contract_reminder 
import logging

scheduler = BackgroundScheduler()

def start_scheduler():
    scheduler.add_job(
        func=send_license_expiry_reminders,
        trigger=CronTrigger(hour=9, minute=0, timezone="Asia/Hong_Kong"),
        id="license_check_job",
        replace_existing=True,
    )

    scheduler.add_job(
        func=send_contract_reminder,
        trigger=CronTrigger(hour=9, minute=30, timezone="Asia/Hong_Kong"),
        id="contract_check_job",
        replace_existing=True,
    )

    if not scheduler.running:
        scheduler.start()
        print("Scheduler started: Daily tasks active for 09:00 and 09:30 HKT.")

    # For testing purpose
    # scheduler.add_job(
    #     func=send_license_expiry_reminders,
    #     trigger="interval",
    #     minutes=1,  # run every 1 minute
    #     timezone="Asia/Hong_Kong",  # Set your desired timezone
    #     id="license_check_job",
    #     replace_existing=True,
    # )

    # scheduler.add_job(
    #     func=send_contract_reminder,
    #     trigger="interval",
    #     minutes=1,  # run every 1 minute
    #     timezone="Asia/Hong_Kong",  # Set your desired timezone
    #     id="contract_check_job",
    #     replace_existing=True,
    # )
    
    # if not scheduler.running:
    #     scheduler.start()
    #     print("Scheduler started: Running every 1 minute.")

def stop_scheduler():
    scheduler.shutdown()
    print("Background scheduler shut down.")