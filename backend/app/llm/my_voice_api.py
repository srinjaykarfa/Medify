import os
import uuid
import shutil
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq
import pyttsx3
import speech_recognition as sr
from pydub import AudioSegment
from fastapi import UploadFile

# Load all environment variables
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client only if API key is available
if GROQ_API_KEY and GROQ_API_KEY != "your_groq_api_key_here":
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None
    print("Warning: GROQ_API_KEY not set. Groq functionality will be disabled.")

tts = pyttsx3.init()

UPLOAD_DIR = "uploads"
RESPONSE_DIR = "responses"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESPONSE_DIR, exist_ok=True)

chat_history = []

def analyze(query_text: str):
    global chat_history

    include_previous = query_text.lower().startswith("previous")

    if include_previous:
        query_text = query_text[len("previous"):].strip()
        previous_context = "\n\n".join([f"Q: {q}\nA: {a}" for q, a in chat_history[-3:]])
        system_prompt = (
            "You are a kind and empathetic medical assistant. Here's the previous conversation:\n"
            f"{previous_context}\n\nContinue helping the user based on their new input. "
            "Be supportive, use phrases like 'Don't worry', 'Take care', and 'It's good that you shared this'."
        )
    else:
        system_prompt = (
            "You are a kind, experienced medical assistant. Respond supportively and clearly, using phrases like "
            "'Don't worry', 'Take care', and 'Thank you for sharing that'. Focus on helping the user feel reassured and informed."
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query_text},
    ]

    if client is None:
        result = "I'm sorry, but the AI service is currently unavailable. Please check your GROQ_API_KEY configuration."
    else:
        try:
            response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=messages,
                temperature=0.6,
                max_tokens=1024,
                top_p=1,
            )
            result = response.choices[0].message.content
        except Exception as e:
            result = f"I'm sorry, there was an error processing your request: {str(e)}"

    chat_history.append((query_text, result))
    return result

def speech_to_text(file_location: str):
    try:
        recognizer = sr.Recognizer()
        
        # Check if file exists
        if not os.path.exists(file_location):
            print(f"❌ Audio file not found: {file_location}")
            return "I couldn't process the audio. Could you type your message instead?"
        
        with sr.AudioFile(file_location) as source:
            audio_data = recognizer.record(source)
            try:
                result = recognizer.recognize_google(audio_data)
                print(f"🎙 Transcribed: {result}")
                return result
            except sr.UnknownValueError:
                return "I couldn't understand the audio. Could you speak more clearly or type your message?"
            except sr.RequestError as e:
                print(f"❌ Speech recognition error: {e}")
                return "Speech recognition service is unavailable. Please type your message."
    
    except Exception as e:
        print(f"❌ Speech processing error: {str(e)}")
        return "I couldn't process the audio. Could you type your message instead?"

def text_to_speech(text: str):
    unique_id = uuid.uuid4().hex
    audio_filename = f"{unique_id}_response.mp3"
    full_path = os.path.join(RESPONSE_DIR, audio_filename)
    tts.save_to_file(text, full_path)
    tts.runAndWait()
    return full_path, f"/responses/{audio_filename}"

# ✅ New: Save and convert uploaded audio to WAV format
def save_and_convert_audio(upload: UploadFile) -> tuple[dict, str]:
    try:
        ext = upload.filename.split('.')[-1]
        raw_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_input.{ext}"
        raw_path = os.path.join(UPLOAD_DIR, raw_filename)

        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)

        # Convert to WAV using pydub
        audio = AudioSegment.from_file(raw_path)
        wav_filename = raw_filename.replace(f".{ext}", ".wav")
        wav_path = os.path.join(UPLOAD_DIR, wav_filename)
        audio.export(wav_path, format="wav")

        return {"url": f"/uploads/{wav_filename}"}, wav_path
    
    except Exception as e:
        print(f"❌ Audio conversion error: {str(e)}")
        # Create a dummy wav file path for fallback
        dummy_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_dummy.wav"
        dummy_path = os.path.join(UPLOAD_DIR, dummy_filename)
        return {"url": f"/uploads/{dummy_filename}"}, dummy_path
