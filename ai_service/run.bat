@echo off
echo Starting StayConnect AI KYC Service on port 8001...
cd /d "%~dp0"
py -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
pause
