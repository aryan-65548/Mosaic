from fastapi import FastAPI
from app.config import CHROMA_URL

app = FastAPI(title="Mosaic AI Engine")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-engine", "chroma_url": CHROMA_URL}