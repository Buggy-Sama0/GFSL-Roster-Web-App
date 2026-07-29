import json
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # Load environment variables from .env file

def convert_data_to_json(data):
    """
    Convert the given data into JSON format using OpenAI's API.

    Args:
        data (str): The data to be converted into JSON format.

    Returns:
        str: The converted JSON data.
    """
    client = OpenAI(
        api_key=os.environ.get("DEEPSEEK_API_KEY"),
        base_url="https://api.deepseek.com"
    )
    
    system_prompt = """
    You are a data extraction assistant. Your task is to convert raw unstructured text into a valid JSON array of worker objects.

    EXAMPLE JSON OUTPUT:
    [
      {
        "name": "Chan Tai Man",
        "role": "Security Guard",
        "hkid": "A123456(7)",
        "cwr_card_no": "CWR98765432",
        "cwr_expiry_date": "2027-08-15",
        "green_card_expiry_date": "2028-03-20",
        "spp_expiry_date": "2027-11-30"
       }
    ]

    STRICT OUTPUT RULES:
    1. Return ONLY valid, raw JSON.
    2. Do NOT wrap output in markdown code blocks (do NOT use ``` or ```json).
    3. Do NOT include any conversational preamble or explanation.
    4. Format all dates as YYYY-MM-DD. 
    5. For date ranges (e.g., '2025/11/27-2030/11/26'), 
       extract only the ending expiration date in YYYY-MM-DD format."
    """

    user_prompt = f"""
    Extract all worker entries from the text enclosed within the <raw_data> tags below:
        <raw_data>
        {data}
        </raw_data>
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    response = client.chat.completions.create(
        model = "deepseek-v4-pro",
        messages = messages,
        stream = False,
        response_format = {
            'type': 'json_object',
        } 
    )

    return response.choices[0].message.content
