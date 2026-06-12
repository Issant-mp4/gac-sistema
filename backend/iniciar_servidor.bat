@echo off
title Lanzador API GAC - Clinica San Rafael
echo ===================================================
echo   Iniciando Entorno Virtual y Servidor FastAPI...
echo ===================================================
echo.

:: 1. Activar el entorno virtual local
call venv\Scripts\activate

:: 2. Arrancar Uvicorn en el puerto 8000
uvicorn main:app --reload

pause