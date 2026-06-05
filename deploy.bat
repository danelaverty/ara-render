@echo off
setlocal

:: ── Configuration ──────────────────────────────────────────────────────────
set GIT="C:\git\bin\git.exe"
set HOST=mediumpurple-butterfly-714997.hostingersite.com
set PUBLIC_URL=https://mediumpurple-butterfly-714997.hostingersite.com

:: ── Push server.js to GitHub (Hostinger auto-deploys on push) ─────────────
echo [1/2] Pushing server.js to GitHub...
%GIT% fetch origin
%GIT% checkout origin/main -- package.json
%GIT% add server.js
%GIT% commit -m "Deploy update" 2>nul
%GIT% push --force origin main
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git push failed.
    pause
    exit /b 1
)
echo       Push OK.

:: ── Verify version ─────────────────────────────────────────────────────────
echo [2/2] Verifying ^(waiting 30s for Hostinger to deploy^)...
timeout /t 30 /nobreak >nul
curl -k -s %PUBLIC_URL%/
echo.
echo Done!
pause
