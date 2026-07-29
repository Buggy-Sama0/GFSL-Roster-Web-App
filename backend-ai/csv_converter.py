import string
import pandas as pd
from pathlib import Path 
import json
import re
import random
import io
from image_to_ocr import convert_data_to_json

raw_text="""
Chan Tai Man,Security Guard,A123456(7),CWR98765432,2027-08-15,2028-03-20,2027-11-30
Wong Siu Ming,Senior Guard,B876543(2),CWR12345678,2026-12-10,2027-06-14,2028-01-15
Lee Wai Ho,Site Inspector,Z543210(9),CWR55667788,2028-05-01,2029-09-10,2027-04-22
"""
raw_text2 = """
MOHAMMAD JHANGIR KHAN	K865533(2)	CWR09012444	06-08-2030	06-01-2028	2025/11/27-2030/11/26	
RAZZAQ ABDUL	P105455(8)	CWR07036111	01-07-2029	26-08-2025	2023/02/07-2028/02/06	
"""
COLUMNS = ['name', 'role', 'hkid', 'cwr_card_no', 'cwr_expiry_date', 'green_card_expiry_date', 'spp_expiry_date']

def fix_bad_zipfile(file_path):
    with open(file_path, 'r+b') as f:
        data = f.read()
        # Find the End of Central Directory signature
        pos = data.find(b'\x50\x4b\x05\x06') 
        if pos > 0:
            print(f"Truncating file at location {pos + 22}")
            f.seek(pos + 22)  # Standard size of the trailing record
            f.truncate()
        else:
            raise ValueError("ZIP signature not found. The file might be completely corrupted.")
# fix_bad_zipfile('Book1.xlsx')
random.seed()

def parse_tsv(raw_text: str) -> pd.DataFrame:
    """
    Parses raw text data (TSV format) into a pandas DataFrame.
    """
    try:
        df = pd.read_csv(io.StringIO(raw_text.strip()), sep="\t", header=None)

        if len(df.columns) == 6:
            df.columns = [
                'name',
                'hkid',
                'cwr_card_no',
                'cwr_expiry_date',
                'green_card_expiry_date',
                'spp_expiry_date',
            ]
            df['role'] = 'Security Guard'
        elif len(df.columns) == 7:
            df.columns = COLUMNS

        # Extract end date from "YYYY/MM/DD-YYYY/MM/DD"
        df['spp_expiry_date'] = df['spp_expiry_date'].apply(
            lambda x: str(x).split('-')[-1].strip()
            if '-' in str(x)
            else str(x))
        
        # Fill missing 'role' values with "Security Guard"
        df["role"] = df["role"].fillna("Security Guard").replace("", "Security Guard")
        return df
    except Exception as e:
        raise ValueError(f"Error parsing TSV data: {e}")

    
def csv_converter(    
    input_source: str | bytes,
    file_extension: str | None = None,
) -> tuple[io.BytesIO, str]:
    """Converts in-memory file bytes, local file paths, or raw unstructured text
        into an in-memory CSV buffer 
    """
    # FILE BYTES IN-MEMORY
    if isinstance(input_source, bytes):
        stream = io.BytesIO(input_source)
        ext = (file_extension or "").lower()

        if ext in [".xlsx", ".xls"]:
            df = pd.read_excel(stream, header=None, engine="openpyxl")
        elif ext in [".txt", ".csv"]:
            df = pd.read_csv(stream, header=None)
        else:
            raise ValueError(f"Unsupported file format: '{ext}'")

        if len(df.columns) == len(COLUMNS):
            df.columns = COLUMNS

        if "role" not in df.columns:
            df["role"] = "Security Guard"
        else:
            df["role"] = (
                df["role"].fillna("Security Guard").replace("", "Security Guard")
            )
        random_str = ''.join(random.choice(string.ascii_lowercase) for _ in range(8))
        output_filename = f"exported_{random_str}.csv"

    # --- INPUT IS A FILE ---
    # elif isinstance(input_source, str) and Path(input_source).is_file():
    #     file = Path(input_source)
        
    #     file_name = 'exported_' + file.stem
    #     file_type = file.suffix

    #     print(f'Converting {file} to {file_name}.csv..')
    #     try:
    #         if file_type == '.txt':
    #             df = pd.read_csv(file, header=None)
    #         elif file_type in ['.xlsx', '.xls']:
    #             df = pd.read_excel(file, header=None, engine='openpyxl')
    #         elif file_type == ".csv":
    #             df = pd.read_csv(file)
    #         else:
    #             print(f"Unsupported file format: .{file_type}")
    #             return

    #         if len(df.columns) == len(COLUMNS):
    #             df.columns = COLUMNS
    #         else:
    #             print(f"Warning: File has {len(df.columns)} columns, expected {len(COLUMNS)}.")

    #         if "role" in df.columns:
    #             df["role"] = df["role"].fillna("Security Guard").replace("", "Security Guard")

    #         output_filename = f"{file_name}.csv"
    #     except Exception as e:
    #         print(f"Error occurred while converting {file}: {e}")
    # --- INPUT IS A RAW TEXT ---
    elif isinstance(input_source, str):
        print("Detected raw text data. Processing via Cloud AI...")
        try:
            df = parse_tsv(raw_text=input_source)
            if df is None or df.empty:
                # Process the raw text data
                json_text = convert_data_to_json(input_source)
                # Clean markdown formatting if present
                if isinstance(json_text, str):
                    json_text = json_text.replace("```json", "").replace("```", "").strip()

                print(type(json_text))

                df = pd.DataFrame(json.loads(json_text))

                if "role" not in df.columns:
                    df["role"] = "Security Guard"
                else:
                    df["role"] = df["role"].fillna("Security Guard").replace("", "Security Guard")
            print("\nParsed Data:")
            print(df)
            random_string = ''.join(random.choice(string.ascii_lowercase) for _ in range(8))
            output_filename = f"exported_{random_string}.csv"
        except Exception as e:
            print(f"Error occurred while processing raw text data: {e}")
    else:
        raise TypeError("Invalid input source. Must be a file path, bytes, or raw text string.")

    output_buffer = io.BytesIO()
    output_buffer.write(df.to_csv(index=False, encoding='utf-8-sig').encode('utf-8-sig'))
    output_buffer.seek(0)
    return output_buffer, output_filename

# input_file = 'Book1.xlsx'  # Replace with your actual file path or raw texts
# csv_converter(input_file)
# # csv_converter(raw_text)
# csv_converter(raw_text2)

# df = pd.read_csv('note.txt', header=None)
# columns = ['name', 'role', 'hkid', 'cwr_card_no', 'cwr_expiry_date', 'green_card_expiry_date', 'spp_expiry_date']
# df.columns = columns

# print([date.strip() for date in df['green_card_expiry_date']])

# date_str = "10/03-2027"

# # Find all characters that are not numbers or spaces
# separators = re.findall(r"[^\d]", date_str)
# print(separators)