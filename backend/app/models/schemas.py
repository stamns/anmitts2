from pydantic import BaseModel, Field
from typing import Dict, Optional


class TTSRequest(BaseModel):
    """Request model for TTS endpoint"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text to convert to speech")
    voice: str = Field(default="DeepSeek", description="Voice ID to use for TTS")


class VoiceInfo(BaseModel):
    """Voice information model"""
    tag: str = Field(..., description="Voice ID/tag")
    name: str = Field(..., description="Voice display name")
    iconUrl: str = Field(..., description="Icon URL for the voice")


class VoicesResponse(BaseModel):
    """Response model for voices endpoint"""
    voices: Dict[str, Dict[str, str]] = Field(..., description="Dictionary of available voices")
    count: int = Field(..., description="Total number of voices")


class HealthResponse(BaseModel):
    """Response model for health check endpoint"""
    status: str = Field(..., description="Health status")
    service: str = Field(default="TTS API", description="Service name")
    version: str = Field(default="1.0.0", description="API version")


class ErrorResponse(BaseModel):
    """Error response model"""
    error: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
