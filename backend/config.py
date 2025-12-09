"""
Configuration module for TTS API

Loads and manages application configuration from environment variables.
"""

import os
from typing import List


class Settings:
    """Application settings loaded from environment"""
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENV: str = os.getenv("ENV", "development")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    ]
    
    # TTS Configuration
    TTS_CACHE_FILE: str = os.getenv("TTS_CACHE_FILE", "robots.json")
    TTS_API_TIMEOUT: int = int(os.getenv("TTS_API_TIMEOUT", "30"))
    TTS_MAX_TEXT_LENGTH: int = int(os.getenv("TTS_MAX_TEXT_LENGTH", "5000"))
    TTS_DEFAULT_VOICE: str = os.getenv("TTS_DEFAULT_VOICE", "DeepSeek")
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # API Configuration
    API_TITLE: str = "TTS API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "FastAPI backend for text-to-speech conversion"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENV.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENV.lower() == "development"
    
    def __repr__(self) -> str:
        """String representation of settings"""
        return (
            f"Settings("
            f"HOST={self.HOST}, "
            f"PORT={self.PORT}, "
            f"ENV={self.ENV}, "
            f"CORS_ORIGINS={self.CORS_ORIGINS}, "
            f"TTS_CACHE_FILE={self.TTS_CACHE_FILE}"
            f")"
        )


# Global settings instance
settings = Settings()
