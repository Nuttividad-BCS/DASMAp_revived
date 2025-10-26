from supabase import create_client
from dotenv import load_dotenv
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(SCRIPT_DIR, ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

def Supabase():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase