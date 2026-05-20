@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0commit-new-blog-posts.ps1" %*
set EXIT_CODE=%ERRORLEVEL%

if "%~1"=="" (
  echo.
  if "%EXIT_CODE%"=="0" (
    echo Done.
  ) else (
    echo Failed. Exit code: %EXIT_CODE%
  )
  pause
)

exit /b %EXIT_CODE%
