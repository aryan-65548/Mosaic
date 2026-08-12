import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_URL = os.getenv("CHROMA_URL", "http://chromadb:8000")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")