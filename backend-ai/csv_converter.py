import string
import pandas as pd
from pathlib import Path 
import json
import re
import random
import io
from image_to_ocr import convert_data_to_json

COLUMNS = ['name', 'role', 'hkid', 'cwr_card_no', 'cwr_expiry_date', 'green_card_expiry_date', 'spp_expiry_date']
DATE_COLS = ['cwr_expiry_date', 'green_card_expiry_date', 'spp_expiry_date']

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

def format_to_yyyy_mm_dd(val: str) -> str:
    """Standardizes dates from DD-MM-YYYY, DD/MM/YYYY, or YYYY/MM/DD to YYYY-MM-DD."""
    if pd.isna(val) or not str(val).strip():
        return ""
    val_str = str(val).strip()

    # Extract end date if date range (e.g. "2025/11/27-2030/11/26")
    if "-" in val_str and "/" in val_str:
        val_str = val_str.split("-")[-1].strip()

    try:
        # Determine if year is first (YYYY/MM/DD or YYYY-MM-DD)
        is_year_first = bool(
            re.match(r"^\d{4}[-/]\d{1,2}[-/]\d{1,2}$", val_str)
        )
        parsed = pd.to_datetime(
            val_str, dayfirst=not is_year_first, errors="coerce"
        )

        if pd.notna(parsed):
            return parsed.strftime("%Y-%m-%d")
    except Exception:
        pass

    return val_str


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Standardizes DataFrame structure, fills default values, formats dates, and orders columns."""
    num_cols = len(df.columns)
    if num_cols < 6:
        raise ValueError(f"Insufficient columns in input data ({num_cols} < 6)")

    if num_cols == 6:
        df.columns = [
            'name',
            'hkid',
            'cwr_card_no',
            'cwr_expiry_date',
            'green_card_expiry_date',
            'spp_expiry_date',
        ]
        df['role'] = 'Security Guard'
    else:
        df = df.iloc[:, :7].copy()
        df.columns = COLUMNS

    # Ensure role defaults to 'Security Guard' if blank or missing
    if 'role' not in df.columns:
        df['role'] = 'Security Guard'
    else:
        df['role'] = (
            df['role'].fillna('Security Guard').replace('', 'Security Guard')
        )

    # Ensure all schema columns exist
    for col in COLUMNS:
        if col not in df.columns:
            df[col] = ""

    # Apply date normalization across date columns
    for col in DATE_COLS:
        if col in df.columns:
            df[col] = df[col].apply(format_to_yyyy_mm_dd)

    return df[COLUMNS]


def parse_tsv(raw_text: str) -> pd.DataFrame | None:
    """Parses raw TSV/space-separated text into a standardized DataFrame."""
    try:
        df = pd.read_csv(
            io.StringIO(raw_text.strip()),
            sep=r"\t+|\s{2,}",
            engine="python",
            header=None,
        )
        return normalize_dataframe(df)
    except Exception as e:
        print(f"Error parsing raw text data: {e}")
        return None
    
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

        df = normalize_dataframe(df)

    # --- INPUT IS A RAW TEXT ---
    elif isinstance(input_source, str):
        print("Processing raw text data...")
        # df = parse_tsv(raw_text=input_source)
        print("Passing to Cloud AI...")
        try:
            json_text = convert_data_to_json(input_source)
            # Clean markdown formatting if present
            if isinstance(json_text, str):
                json_text = json_text.replace("```json", "").replace("```", "").strip()

            print(type(json_text))

            df = pd.DataFrame(json.loads(json_text))
            df = normalize_dataframe(df)
        except json.JSONDecodeError as e:
            raise ValueError(f"Cloud AI response was not valid JSON: {e}") from e
        except Exception as e:
            raise ValueError(f"Cloud AI processing failed: {e}") from e
        print("\nParsed Data:")
        print(df)
    else:
        raise TypeError("Invalid input source. Must be a file path, bytes, or raw text string.")

    random_string = ''.join(random.choice(string.ascii_lowercase) for _ in range(8))
    output_filename = f"exported_{random_string}.csv"
    output_buffer = io.BytesIO()
    output_buffer.write(df.to_csv(index=False).encode('utf-8-sig'))
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