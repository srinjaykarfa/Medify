from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime
from typing import Optional
import shutil
import os
import json
from pymongo import MongoClient, DESCENDING
from bson import ObjectId
from pydantic import BaseModel
from dotenv import load_dotenv

# Import your LLM & voice pipeline
from app.llm.my_voice_api import analyze, speech_to_text, text_to_speech, save_and_convert_audio

load_dotenv()

router = APIRouter()

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("MONGODB_DB")]

# Upload directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatMessage(BaseModel):
    sender: str
    timestamp: str
    text: Optional[str] = None
    file: Optional[dict] = None
    audio: Optional[dict] = None
    response_text: Optional[str] = None
    response_audio: Optional[str] = None

@router.post("/")
def chat(
    sender: str = Form(...),
    timestamp: str = Form(...),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    try:
        print("🔹 Received chat request")
        file_data = None
        audio_data = None
        user_text = text

        # Process file upload
        if file:
            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_data = {
                "type": file.content_type,
                "name": file.filename,
                "path": f"/uploads/{filename}"
            }

        # Process audio upload
        if audio:
            print(f"🎙 Saving and converting audio: {audio.filename}")
            try:
                audio_data, wav_path = save_and_convert_audio(audio)
                print("🎙 Transcribing audio...")
                user_text = speech_to_text(wav_path)
                
                # Check if transcription contains error message
                if not user_text or "couldn't process" in user_text or "couldn't understand" in user_text:
                    print("❌ Audio processing failed, using fallback message")
                    user_text = "I sent a voice message but there was an issue processing it. Could you help me with general health advice?"
                    
            except Exception as e:
                print(f"❌ Audio processing error: {str(e)}")
                user_text = "I tried to send a voice message but encountered an error. Could you help me with general health advice?"
                audio_data = None

        print(f"Analyzing input: {user_text}")
        response_text = analyze(user_text)
        _, response_audio_url = text_to_speech(response_text)

        chat_message = {
            "sender": sender,
            "timestamp": timestamp,
            "text": user_text,
            "file": file_data,
            "audio": audio_data,
            "response_text": response_text,
            "response_audio": response_audio_url,
            "created_at": datetime.now()
        }

        result = db.chats.insert_one(chat_message)
        stored_message = db.chats.find_one({"_id": result.inserted_id})
        stored_message["_id"] = str(stored_message["_id"])

        return stored_message

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_chat_messages():
    try:
        messages = list(db.chats.find().sort("created_at", DESCENDING).limit(100))
        for message in messages:
            message["_id"] = str(message["_id"])
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
