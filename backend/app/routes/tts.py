import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from app.services.tts_service import NanoAITTS
from app.models.schemas import TTSRequest, VoicesResponse, HealthResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["tts"])

# Global TTS service instance
tts_service: NanoAITTS = None


def init_tts_service(cache_file: str = "robots.json"):
    """Initialize the TTS service"""
    global tts_service
    tts_service = NanoAITTS(cache_file=cache_file)
    logger.info("TTS service initialized")


@router.get("/health")
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(status="healthy")


@router.get("/voices")
async def get_voices() -> VoicesResponse:
    """Get list of available voices"""
    if tts_service is None:
        raise HTTPException(status_code=500, detail="TTS service not initialized")
    
    if not tts_service.voices:
        raise HTTPException(status_code=503, detail="No voices available")
    
    return VoicesResponse(
        voices=tts_service.voices,
        count=len(tts_service.voices)
    )


@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    """Convert text to speech and return MP3 audio"""
    if tts_service is None:
        raise HTTPException(status_code=500, detail="TTS service not initialized")
    
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    if request.voice not in tts_service.voices:
        logger.warning(f"Requested voice '{request.voice}' not found, using default")
        voice = list(tts_service.voices.keys())[0] if tts_service.voices else "DeepSeek"
    else:
        voice = request.voice
    
    try:
        logger.info(f"Processing TTS request: text_length={len(request.text)}, voice={voice}")
        audio_data = tts_service.get_audio(request.text, voice)
        
        return StreamingResponse(
            io.BytesIO(audio_data),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    except Exception as e:
        logger.error(f"TTS processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {str(e)}")
