@echo off
REM Double-click this file to install packages and start the website.
cd /d "%~dp0"
call npm install
echo.
echo Starting ThumbStop... open http://localhost:3000 in your browser.
call npm run dev
pause
