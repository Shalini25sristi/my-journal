@echo off
echo Starting My Journal...
echo.

echo [1/2] Starting PostgreSQL (safe to ignore if already running)...
"C:\Users\user\pgsql\bin\pg_ctl.exe" -D "C:\Users\user\My Journal\postgres-data" -l "C:\Users\user\My Journal\postgres-data\postgres.log" start >nul 2>&1
echo.

echo [2/2] Starting Node.js server...
echo Open this link in your browser: http://localhost:8000
echo.
node server/index.js
pause
