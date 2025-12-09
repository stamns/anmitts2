@echo off
REM Setup script for TTS API backend (Windows)

echo.
echo ======================================
echo TTS API Backend Setup (Windows)
echo ======================================

REM Check Python version
python --version

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo OK: Virtual environment created
) else (
    echo OK: Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo OK: Dependencies installed

REM Copy .env.example to .env if .env doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo OK: .env file created. Please review and update if needed.
) else (
    echo OK: .env file already exists
)

REM Test the application
echo.
echo Testing application...
python test_api.py

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo To start the development server, run:
echo   venv\Scripts\activate.bat
echo   python -m uvicorn app.main:app --reload
echo.
echo The API will be available at http://localhost:8000
echo API documentation: http://localhost:8000/docs
