@echo off
setlocal

:: ── Configuration ──────────────────────────────────────────────────────────
set RENDER_URL=https://mediumpurple-butterfly-714997.hostingersite.com/render
set OUT_FILE=render.png
set PHOTO_PATH=/home/u903000087/domains/mediumpurple-butterfly-714997.hostingersite.com/photos/brighlee.jpg

:: ── Render ─────────────────────────────────────────────────────────────────
echo Requesting render...
curl -k -s -X POST %RENDER_URL% -H "Content-Type: application/json" -d "{\"name\":\"Brighlee Roe\",\"practice\":\"Glow Grounds Studio\",\"instagram\":\"glowgroundsstudio\",\"city\":\"Buffalo\",\"state\":\"NY\",\"epithet\":\"Reiki and Animal Reiki sessions\",\"question\":\"What is your vision for your Reiki practice?\",\"answer\":\"My vision for my practice is to provide energy work using Reiki, Animal Reiki, and Shamanic practices to help all living beings reach their highest potential in the comfort of their own space.\",\"bgColor\":\"#eef3ee\",\"accentColor\":\"#6a9473\",\"textColor\":\"#22302a\",\"imagePanX\":0,\"imagePanY\":13,\"photoPath\":\"%PHOTO_PATH%\"}" -o %OUT_FILE%

:: ── Check result ───────────────────────────────────────────────────────────
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: curl failed.
    pause
    exit /b 1
)

for %%A in (%OUT_FILE%) do set FILE_SIZE=%%~zA
if %FILE_SIZE% LSS 10000 (
    echo ERROR: Output file too small ^(%FILE_SIZE% bytes^) — server may have returned an error:
    type %OUT_FILE%
    pause
    exit /b 1
)

echo OK: %FILE_SIZE% bytes received.
echo Opening %OUT_FILE%...
start %OUT_FILE%
