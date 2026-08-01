from apscheduler.schedulers.background import BackgroundScheduler
from license_notify import get_email_notification  

scheduler = BackgroundScheduler()

def start_scheduler():
    # scheduler.add_job(
    #     func=get_email_notification,
    #     trigger="cron",
    #     hour=9,  # run at 9:00 AM every day
    #     minute=0,  
    #     timezone="Asia/Hong_Kong",  # Set your desired timezone
    #     id="license_check_job",
    #     replace_existing=True,
    # )
    scheduler.add_job(
        func=get_email_notification,
        trigger="interval",
        minutes=1,  # run every 1 minute
        timezone="Asia/Hong_Kong",  # Set your desired timezone
        id="license_check_job",
        replace_existing=True,
    )
    if not scheduler.running:
        scheduler.start()
        print("Scheduler started: Running every 1 minute.")


def stop_scheduler():
    scheduler.shutdown()
    print("Background scheduler shut down.")