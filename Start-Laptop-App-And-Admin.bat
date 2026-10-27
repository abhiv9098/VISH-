@echo off
title Vishwakarma Atta App & Admin Panel (Laptop Launcher)
color 0A

echo ========================================================
echo       VISHWAKARMA ATTA CHAKKI - LAPTOP LAUNCHER
echo ========================================================
echo.
echo Checking server status on port 4000...
echo.

cd /d "%~dp0"

netstat -ano | findstr :4000 >nul
if %errorlevel% equ 0 (
    echo [OK] Server is already running on port 4000!
) else (
    echo [INFO] Starting Next.js Dev Server on port 4000...
    start "Vishwakarma Server (Port 4000)" npm run dev
    echo Waiting 5 seconds for server to initialize...
    timeout /t 5 /nobreak >nul
)

echo.
echo Opening Customer App & Admin Panel in your browser...
start http://localhost:4000
timeout /t 1 /nobreak >nul
start http://localhost:4000/admin

echo.
echo ========================================================
echo   [1] Customer App:   http://localhost:4000
echo   [2] Admin Panel:    http://localhost:4000/admin
echo   [3] Admin Orders:   http://localhost:4000/admin/orders
echo ========================================================
echo.
echo Both pages are now running on your laptop!
echo (You can close this window at any time)
timeout /t 6 >nul
exit
