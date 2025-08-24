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
import numpy as np

# Optional imports for better audio processing
try:
    import soundfile as sf
    import librosa
    ADVANCED_AUDIO = True
    print("✅ Advanced audio libraries loaded")
except ImportError:
    ADVANCED_AUDIO = False
    print("⚠️ Advanced audio libraries not available, using basic processing")

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
    import time
    import wave
    import struct
    try:
        recognizer = sr.Recognizer()
        
        # Check if file exists and wait a moment for file system
        if not os.path.exists(file_location):
            print(f"❌ Audio file not found: {file_location}")
            return "I couldn't process the audio. Could you type your message instead?"
        
        # Wait for file to be fully written
        time.sleep(0.1)
        
        print(f"🎙 Processing audio file: {file_location}")
        file_size = os.path.getsize(file_location)
        print(f"📊 File size: {file_size} bytes")
        
        if file_size < 1000:  # Very small files are likely empty or corrupted
            print("❌ File is too small or empty")
            return "The audio file appears to be empty or corrupted. Please try recording again."
        
        # Detect file format
        with open(file_location, 'rb') as f:
            header = f.read(16)
        
        actual_format = 'unknown'
        if header.startswith(b'RIFF') and b'WAVE' in header:
            actual_format = 'wav'
        elif header.startswith(b'\x1a\x45\xdf\xa3'):
            actual_format = 'webm'  # EBML header (WebM/Matroska)
        elif header.startswith(b'OggS'):
            actual_format = 'ogg'
        elif header.startswith(b'ID3') or header.startswith(b'\xff\xfb'):
            actual_format = 'mp3'
        
        print(f"🔍 Detected format: {actual_format}")
        
        # Configure recognizer for better results
        recognizer.energy_threshold = 300
        recognizer.dynamic_energy_threshold = True
        recognizer.pause_threshold = 0.5
        
        # Try multiple processing methods
        audio_data = None
        processing_success = False
        
        # Method 1: Try advanced libraries first (handles WebM and other formats)
        if ADVANCED_AUDIO and not processing_success:
            try:
                print("🔄 Using librosa/soundfile for audio processing...")
                
                # Load audio using librosa (handles WebM through ffmpeg backend)
                audio_np, sample_rate = librosa.load(file_location, sr=16000, mono=True)
                print(f"✅ Librosa loaded: {len(audio_np)} samples at {sample_rate}Hz")
                
                if len(audio_np) > 0:
                    # Create a compatible WAV file for speech_recognition
                    temp_wav = file_location.replace(os.path.basename(file_location), f"librosa_{int(time.time())}.wav")
                    
                    # Normalize and convert to int16
                    if audio_np.dtype != np.int16:
                        if np.max(np.abs(audio_np)) > 0:
                            audio_np = audio_np / np.max(np.abs(audio_np)) * 0.9
                        audio_np = (audio_np * 32767).astype(np.int16)
                    
                    # Save as PCM WAV
                    sf.write(temp_wav, audio_np, sample_rate, subtype='PCM_16')
                    print(f"✅ Created compatible WAV: {temp_wav}")
                    
                    # Process with speech_recognition
                    with sr.AudioFile(temp_wav) as source:
                        audio_data = recognizer.record(source)
                        print("✅ Audio data loaded successfully with librosa conversion")
                        processing_success = True
                    
                    # Clean up temp file
                    try:
                        os.remove(temp_wav)
                    except:
                        pass
                else:
                    print("⚠️ Audio data is empty after loading")
                    
            except Exception as librosa_error:
                print(f"⚠️ Librosa processing failed: {librosa_error}")
        
        # Method 2: Manual WebM processing (without FFmpeg)
        if not processing_success and actual_format == 'webm':
            try:
                print("🔧 Manual WebM audio extraction (no FFmpeg required)...")
                
                # Read the WebM file
                with open(file_location, 'rb') as f:
                    data = f.read()
                
                print(f"📁 WebM file size: {len(data)} bytes")
                
                # WebM files contain Opus or Vorbis audio in Matroska container
                # We'll try to extract raw audio data patterns
                
                # Skip EBML header (first ~100 bytes) and look for audio segments
                audio_candidates = []
                
                # Look for segments that might contain audio data
                # Try multiple strategies to find audio
                
                # Strategy 1: Look for data patterns after headers
                print("🔍 Strategy 1: Scanning for audio patterns...")
                for start in range(500, len(data) - 8000, 1000):  # Larger steps, bigger segments
                    segment = data[start:start + 8000]
                    
                    # Check if this segment has audio-like characteristics
                    unique_bytes = len(set(segment))
                    zero_count = segment.count(0)
                    
                    # Audio should have good variation but not be mostly zeros
                    if unique_bytes > 50 and zero_count < len(segment) * 0.3:
                        print(f"📍 Found candidate at {start}: {unique_bytes} unique bytes, {zero_count} zeros")
                        audio_candidates.append((start, segment))
                        if len(audio_candidates) >= 5:
                            break
                
                # Strategy 2: If no good candidates, be more lenient
                if len(audio_candidates) < 2:
                    print("🔍 Strategy 2: Relaxed search...")
                    for start in range(1000, len(data) - 4000, 2000):
                        segment = data[start:start + 4000]
                        unique_bytes = len(set(segment))
                        
                        # Much more lenient criteria
                        if unique_bytes > 20:
                            print(f"📍 Relaxed candidate at {start}: {unique_bytes} unique bytes")
                            audio_candidates.append((start, segment))
                            if len(audio_candidates) >= 10:
                                break
                
                # Strategy 3: Use the middle portion of the file
                if len(audio_candidates) < 3:
                    print("🔍 Strategy 3: Using middle portion...")
                    middle_start = len(data) // 3
                    middle_end = (len(data) * 2) // 3
                    chunk_size = 3000
                    
                    for start in range(middle_start, middle_end - chunk_size, chunk_size):
                        segment = data[start:start + chunk_size]
                        audio_candidates.append((start, segment))
                        if len(audio_candidates) >= 8:
                            break
                
                if audio_candidates:
                    print(f"🎵 Found {len(audio_candidates)} potential audio segments")
                    
                    # Try different combinations of the audio data
                    for attempt in range(3):  # Try up to 3 different approaches
                        try:
                            if attempt == 0:
                                # Approach 1: Use first few segments
                                print("🎯 Attempt 1: Using first segments...")
                                combined_data = b''.join([seg for _, seg in audio_candidates[:3]])
                            elif attempt == 1:
                                # Approach 2: Use middle segments
                                print("🎯 Attempt 2: Using middle segments...")
                                mid_start = len(audio_candidates) // 3
                                combined_data = b''.join([seg for _, seg in audio_candidates[mid_start:mid_start+3]])
                            else:
                                # Approach 3: Use all available data
                                print("🎯 Attempt 3: Using all segments...")
                                combined_data = b''.join([seg for _, seg in audio_candidates])
                            
                            if len(combined_data) < 2000:
                                print(f"⚠️ Not enough data: {len(combined_data)} bytes")
                                continue
                            
                            # Try multiple audio format interpretations
                            import struct
                            
                            for format_attempt, (format_name, format_code, bytes_per_sample, scale_factor) in enumerate([
                                ("16-bit signed LE", '<h', 2, 32768.0),
                                ("8-bit unsigned", 'B', 1, 128.0),
                                ("16-bit signed BE", '>h', 2, 32768.0),
                                ("32-bit float LE", '<f', 4, 1.0)
                            ]):
                                try:
                                    print(f"🔄 Format {format_attempt+1}: {format_name}")
                                    
                                    # Extract samples
                                    num_samples = len(combined_data) // bytes_per_sample
                                    if num_samples < 1000:
                                        print(f"⚠️ Too few samples: {num_samples}")
                                        continue
                                    
                                    # Limit samples to prevent memory issues
                                    max_samples = min(num_samples, 80000)  # Max ~5 seconds at 16kHz
                                    sample_data = combined_data[:max_samples * bytes_per_sample]
                                    
                                    if format_code == 'B':
                                        # 8-bit unsigned
                                        samples = struct.unpack('B' * max_samples, sample_data)
                                        audio_np = np.array(samples, dtype=np.float32) / scale_factor - 1.0
                                    elif format_code == '<f':
                                        # 32-bit float
                                        samples = struct.unpack('<f' * max_samples, sample_data)
                                        audio_np = np.array(samples, dtype=np.float32)
                                    else:
                                        # 16-bit integer formats
                                        samples = struct.unpack(format_code * max_samples, sample_data)
                                        audio_np = np.array(samples, dtype=np.float32) / scale_factor
                                    
                                    # Quality checks - be more lenient
                                    std_dev = np.std(audio_np)
                                    mean_abs = np.mean(np.abs(audio_np))
                                    max_val = np.max(np.abs(audio_np))
                                    
                                    print(f"📊 Audio stats: std={std_dev:.4f}, mean_abs={mean_abs:.4f}, max={max_val:.4f}")
                                    
                                    # Very lenient quality check
                                    if std_dev > 0.001 and mean_abs > 0.0001 and len(audio_np) > 4000:
                                        print(f"✅ Audio quality acceptable with {format_name}")
                                        
                                        # Clean up the audio
                                        # Remove DC offset
                                        audio_np = audio_np - np.mean(audio_np)
                                        
                                        # Apply simple noise reduction
                                        # Calculate noise floor (lowest 10% of absolute values)
                                        sorted_abs = np.sort(np.abs(audio_np))
                                        noise_floor = sorted_abs[int(len(sorted_abs) * 0.1)]
                                        
                                        # Apply soft noise gate
                                        if noise_floor > 0:
                                            audio_np = np.where(np.abs(audio_np) > noise_floor * 2, audio_np, audio_np * 0.3)
                                        
                                        # Normalize amplitude
                                        max_val = np.max(np.abs(audio_np))
                                        if max_val > 0:
                                            audio_np = audio_np / max_val * 0.9
                                        
                                        # Apply simple high-pass filter to remove low-frequency noise
                                        # Simple difference filter (approximates high-pass)
                                        if len(audio_np) > 100:
                                            filtered = np.zeros_like(audio_np)
                                            filtered[1:] = audio_np[1:] - 0.95 * audio_np[:-1]
                                            audio_np = filtered
                                            
                                            # Renormalize after filtering
                                            max_val = np.max(np.abs(audio_np))
                                            if max_val > 0:
                                                audio_np = audio_np / max_val * 0.8
                                        
                                        # Ensure we have reasonable length (1-6 seconds for better recognition)
                                        target_samples = min(len(audio_np), 96000)  # Max 6 seconds at 16kHz
                                        if len(audio_np) > target_samples:
                                            # Take middle portion (skip potential header noise)
                                            start_idx = len(audio_np) // 4  # Skip first quarter
                                            end_idx = start_idx + target_samples
                                            if end_idx > len(audio_np):
                                                end_idx = len(audio_np)
                                                start_idx = max(0, end_idx - target_samples)
                                            audio_np = audio_np[start_idx:end_idx]
                                        
                                        print(f"🎯 Final processed audio: {len(audio_np)} samples, max={np.max(np.abs(audio_np)):.3f}")
                                        
                                        # Create temporary WAV file
                                        temp_wav = file_location.replace(os.path.basename(file_location), f"webm_extract_{attempt}_{format_attempt}_{int(time.time())}.wav")
                                        
                                        # Convert to int16 and save
                                        audio_int16 = np.clip(audio_np * 32767, -32767, 32767).astype(np.int16)
                                        sf.write(temp_wav, audio_int16, 16000, subtype='PCM_16')
                                        print(f"✅ Created enhanced WAV: {temp_wav}")
                                        
                                        # Try speech recognition with adjusted settings
                                        with sr.AudioFile(temp_wav) as source:
                                            # Adjust noise and phrase time limits for extracted audio
                                            recognizer.adjust_for_ambient_noise(source, duration=0.5)
                                            audio_data = recognizer.record(source)
                                            print("✅ Speech recognition ready with enhanced audio!")
                                            processing_success = True
                                        
                                        # Clean up temp file
                                        try:
                                            os.remove(temp_wav)
                                        except:
                                            pass
                                        
                                        break  # Success, exit format loop
                                        
                                except Exception as format_error:
                                    print(f"⚠️ {format_name} failed: {format_error}")
                                    continue
                            
                            if processing_success:
                                break  # Success, exit attempt loop
                                
                        except Exception as attempt_error:
                            print(f"⚠️ Attempt {attempt+1} failed: {attempt_error}")
                            continue
                
                if not processing_success:
                    print("❌ Could not extract usable audio from WebM")
                    print("💡 The WebM file appears to contain audio data, but it may be:")
                    print("   - Very quiet or unclear speech")
                    print("   - Encoded in a format that's hard to extract manually")
                    print("   - Containing background noise instead of speech")
                    print("   - Compressed audio that needs proper WebM decoding")
                    print("\n🔧 For best results with WebM audio, consider:")
                    print("   1. Installing FFmpeg for proper WebM support")
                    print("   2. Using Chrome's built-in recorder with WAV format")
                    print("   3. Speaking more clearly and closer to the microphone")
                    
            except Exception as webm_error:
                print(f"⚠️ Manual WebM processing failed: {webm_error}")
        
        # Method 3: Try pydub for other formats (with FFmpeg)
        if not processing_success and actual_format != 'webm':
            try:
                print(f"🔄 Using pydub for {actual_format} conversion...")
                
                # Load with pydub based on detected format
                if actual_format == 'ogg':
                    audio = AudioSegment.from_ogg(file_location)
                elif actual_format == 'mp3':
                    audio = AudioSegment.from_mp3(file_location)
                elif actual_format == 'wav':
                    audio = AudioSegment.from_wav(file_location)
                else:
                    audio = AudioSegment.from_file(file_location)
                
                print(f"✅ Pydub loaded: {len(audio)}ms duration")
                
                # Convert to compatible format
                audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                
                # Export as compatible WAV
                temp_wav = file_location.replace(os.path.basename(file_location), f"pydub_{int(time.time())}.wav")
                audio.export(temp_wav, format="wav")
                print(f"✅ Created compatible WAV with pydub: {temp_wav}")
                
                # Process with speech_recognition
                with sr.AudioFile(temp_wav) as source:
                    audio_data = recognizer.record(source)
                    print("✅ Audio data loaded successfully with pydub conversion")
                    processing_success = True
                
                # Clean up temp file
                try:
                    os.remove(temp_wav)
                except:
                    pass
                    
            except Exception as pydub_error:
                print(f"⚠️ Pydub processing failed: {pydub_error}")
        
        # Method 4: Try WAV format fixing for corrupted WAV files
        if not processing_success and actual_format == 'wav':
            try:
                print("🔄 Attempting to read and fix WAV file...")
                
                # Try to read as WAV and get info
                with wave.open(file_location, 'rb') as wav_file:
                    frames = wav_file.readframes(wav_file.getnframes())
                    sample_rate = wav_file.getframerate()
                    channels = wav_file.getnchannels()
                    sample_width = wav_file.getsampwidth()
                    
                    print(f"📊 WAV info: {sample_rate}Hz, {channels}ch, {sample_width*8}bit")
                    
                    # Create a compatible WAV file
                    temp_wav = file_location.replace(os.path.basename(file_location), f"fixed_{int(time.time())}.wav")
                    
                    with wave.open(temp_wav, 'wb') as fixed_wav:
                        fixed_wav.setnchannels(1)  # Force mono
                        fixed_wav.setsampwidth(2)  # Force 16-bit
                        fixed_wav.setframerate(16000)  # Force 16kHz
                        
                        # Convert audio data
                        if sample_width == 4:  # 32-bit float to 16-bit int
                            audio_array = struct.unpack('<' + 'f' * (len(frames) // 4), frames)
                            # Convert float to int16
                            int16_data = [int(sample * 32767) for sample in audio_array]
                            frames = struct.pack('<' + 'h' * len(int16_data), *int16_data)
                        elif sample_width == 3:  # 24-bit to 16-bit
                            # Convert 24-bit to 16-bit (simplified)
                            int16_data = []
                            for i in range(0, len(frames), 3):
                                if i + 2 < len(frames):
                                    # Take the upper 2 bytes of 3-byte sample
                                    sample = struct.unpack('<i', frames[i:i+3] + b'\x00')[0] >> 8
                                    int16_data.append(sample)
                            frames = struct.pack('<' + 'h' * len(int16_data), *int16_data)
                        
                        # Resample if needed (simple decimation)
                        if sample_rate != 16000:
                            step = sample_rate // 16000
                            if step > 1:
                                # Simple decimation
                                int16_array = struct.unpack('<' + 'h' * (len(frames) // 2), frames)
                                resampled = int16_array[::step]
                                frames = struct.pack('<' + 'h' * len(resampled), *resampled)
                        
                        # Convert to mono if stereo
                        if channels == 2:
                            int16_array = struct.unpack('<' + 'h' * (len(frames) // 2), frames)
                            mono_data = []
                            for i in range(0, len(int16_array), 2):
                                if i + 1 < len(int16_array):
                                    # Average left and right channels
                                    mono_sample = (int16_array[i] + int16_array[i + 1]) // 2
                                    mono_data.append(mono_sample)
                            frames = struct.pack('<' + 'h' * len(mono_data), *mono_data)
                        
                        fixed_wav.writeframes(frames)
                    
                    print(f"✅ Created fixed WAV: {temp_wav}")
                    
                    # Try to process with speech_recognition
                    with sr.AudioFile(temp_wav) as source:
                        audio_data = recognizer.record(source)
                        print("✅ Audio data loaded successfully with WAV fix")
                        processing_success = True
                    
                    # Clean up temp file
                    try:
                        os.remove(temp_wav)
                    except:
                        pass
                        
            except Exception as wav_error:
                print(f"⚠️ WAV fix processing failed: {wav_error}")
        
        if not processing_success or audio_data is None:
            print("❌ All audio processing methods failed")
            return f"I couldn't process the {actual_format} audio format. Please try recording again or type your message."
        
        # Perform speech recognition with multiple attempts
        print("🗣️ Starting speech recognition...")
        
        # Method 1: Try Google Speech Recognition (most accurate)
        try:
            result = recognizer.recognize_google(audio_data, language='en-US')
            print(f"✅ Google STT successful: {result}")
            return result
        except sr.UnknownValueError:
            print("⚠️ Google STT couldn't understand audio")
        except sr.RequestError as e:
            print(f"⚠️ Google STT service error: {e}")
        
        # Method 2: Try with different language/region
        try:
            result = recognizer.recognize_google(audio_data, language='en-IN')
            print(f"✅ Google STT (alternative) successful: {result}")
            return result
        except sr.UnknownValueError:
            print("⚠️ Google STT (alternative) couldn't understand audio")
        except sr.RequestError:
            pass
        
        # Method 3: Try with show_all option for partial results
        try:
            result = recognizer.recognize_google(audio_data, language='en-US', show_all=True)
            if result and 'alternative' in result:
                best_result = result['alternative'][0]['transcript']
                print(f"✅ Google STT (show_all) successful: {best_result}")
                return best_result
        except Exception as e:
            print(f"⚠️ Google STT (show_all) failed: {e}")
        
        # If all methods fail
        return "I couldn't understand the audio clearly. Please speak more clearly and try again, or type your message."
            
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
    import time
    try:
        # Detect actual file format by reading header
        file_content = upload.file.read()
        upload.file.seek(0)  # Reset file pointer
        
        # Check file format by magic bytes
        actual_format = 'unknown'
        if file_content.startswith(b'RIFF') and b'WAVE' in file_content[:12]:
            actual_format = 'wav'
        elif file_content.startswith(b'\x1a\x45\xdf\xa3'):
            actual_format = 'webm'  # EBML header (WebM/Matroska)
        elif file_content.startswith(b'OggS'):
            actual_format = 'ogg'
        elif file_content.startswith(b'ID3') or file_content.startswith(b'\xff\xfb'):
            actual_format = 'mp3'
        
        print(f"� Detected audio format: {actual_format}")
        
        ext = upload.filename.split('.')[-1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')[:-3]  # Include milliseconds
        
        # Use detected format for filename
        if actual_format != 'unknown':
            raw_filename = f"{timestamp}_input.{actual_format}"
        else:
            raw_filename = f"{timestamp}_input.{ext}"
            
        raw_path = os.path.join(UPLOAD_DIR, raw_filename)

        print(f"📁 Saving uploaded file as: {raw_filename}")
        
        # Write to disk
        with open(raw_path, "wb") as buffer:
            buffer.write(file_content)
            buffer.flush()
            os.fsync(buffer.fileno())  # Force write to disk

        print(f"✅ File saved: {raw_path} ({len(file_content)} bytes)")
        
        # Wait for file system to release the file
        time.sleep(0.2)
        
        # Convert to WAV using available methods
        wav_filename = f"{timestamp}_converted.wav"
        wav_path = os.path.join(UPLOAD_DIR, wav_filename)

        conversion_success = False
        
        # Try advanced libraries first if available
        if ADVANCED_AUDIO and not conversion_success:
            try:
                print(f"🔄 Converting {actual_format} to WAV using librosa...")
                
                # Load with error handling
                audio_data, sample_rate = librosa.load(raw_path, sr=16000, mono=True)
                print(f"✅ Loaded: {len(audio_data)} samples at {sample_rate}Hz")
                
                if len(audio_data) > 0:
                    # Save as WAV
                    sf.write(wav_path, audio_data, sample_rate, subtype='PCM_16')
                    print("✅ Conversion successful with librosa")
                    conversion_success = True
                else:
                    print("⚠️ Audio data is empty")
                
            except Exception as librosa_error:
                print(f"⚠️ Librosa conversion failed: {librosa_error}")

        # Fallback: Try pydub (better for WebM)
        if not conversion_success:
            try:
                print(f"🔄 Converting {actual_format} to WAV using pydub...")
                
                # For WebM, we need to be explicit about format
                if actual_format == 'webm':
                    audio = AudioSegment.from_file(raw_path, format="webm")
                elif actual_format == 'ogg':
                    audio = AudioSegment.from_ogg(raw_path)
                elif actual_format == 'mp3':
                    audio = AudioSegment.from_mp3(raw_path)
                else:
                    audio = AudioSegment.from_file(raw_path)
                
                # Normalize for speech recognition
                audio = audio.set_frame_rate(16000).set_channels(1)
                audio.export(wav_path, format="wav")
                print("✅ Conversion successful with pydub")
                conversion_success = True
            except Exception as pydub_error:
                print(f"⚠️ Pydub conversion failed: {pydub_error}")

        if conversion_success:
            return {"url": f"/uploads/{wav_filename}"}, wav_path
        else:
            # Use original file as last resort
            print("🔄 Using original file for direct processing...")
            return {"url": f"/uploads/{raw_filename}"}, raw_path

    except Exception as e:
        print(f"❌ Audio processing error: {str(e)}")
        raise Exception(f"Failed to process audio file: {str(e)}")
