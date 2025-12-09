import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import tts
from app.models.schemas import HealthResponse

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    logger.info("Starting TTS API application")
    tts.init_tts_service(cache_file=os.getenv("TTS_CACHE_FILE", "robots.json"))
    yield
    # Shutdown
    logger.info("Shutting down TTS API application")


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    app = FastAPI(
        title="TTS API",
        description="FastAPI backend for text-to-speech conversion",
        version="1.0.0",
        lifespan=lifespan,
    )
    
    # Configure CORS
    allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    allowed_origins = [origin.strip() for origin in allowed_origins]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    logger.info(f"CORS configured for origins: {allowed_origins}")
    
    # Include routers
    app.include_router(tts.router)
    
    # Root endpoint
    @app.get("/")
    async def root():
        return {
            "message": "TTS API Server",
            "docs": "/docs",
            "health": "/api/health"
        }
    
    logger.info("FastAPI application initialized")
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENV", "development") == "development",
    )
