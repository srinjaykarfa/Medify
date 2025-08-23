# Medify Backend Setup Guide

## Python Environment Setup Complete ✅

**Environment Details:**
- Environment Type: Conda
- Python Version: 3.11.9
- Environment Name: medify-backend
- Location: C:\Users\hp\.conda\envs\medify-backend

## How to Run the Backend Server

### Option 1: Using Conda Run (Recommended)
```powershell
cd "c:\Users\hp\Desktop\coding\Medify\backend"
C:/ProgramData/anaconda3/Scripts/conda.exe run -n medify-backend uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Activate Environment First
```powershell
cd "c:\Users\hp\Desktop\coding\Medify\backend"
# Note: You may need to run conda init first if not done already
conda activate medify-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Installed Packages ✅

All required packages from `requirements.txt` have been successfully installed:
- ✅ FastAPI (0.104.1)
- ✅ Uvicorn (0.24.0)
- ✅ PyMongo (4.14.1)
- ✅ TensorFlow (2.18.0)
- ✅ Groq (0.22.0)
- ✅ Pydantic with email support
- ✅ Authentication packages (PyJWT, Passlib, bcrypt)
- ✅ ML packages (scikit-learn, joblib)
- ✅ Image processing (Pillow, pytesseract)
- ✅ Audio processing (pyttsx3, SpeechRecognition, pydub)
- ✅ And all other dependencies

## Environment Variables

Environment variables have been set up in `.env` file:
- MONGODB_URL=mongodb://localhost:27017
- MONGODB_DB=medify_db
- GROQ_API_KEY=your_groq_api_key_here
- SECRET_KEY=your_secret_key_here
- JWT_SECRET=your_jwt_secret_here

**Note:** Update these with your actual values.

## Testing

The FastAPI application loads successfully with all dependencies.

## Next Steps

1. Update the `.env` file with your actual API keys and secrets
2. Start MongoDB if using local instance
3. Run the backend server using one of the commands above
4. The API will be available at: http://localhost:8000
5. API documentation will be available at: http://localhost:8000/docs

## Troubleshooting

- If you get permission errors, make sure you have proper conda environment access
- For MongoDB connection issues, ensure MongoDB is running and the connection string is correct
- For missing ffmpeg warnings, install ffmpeg if you need audio processing features
