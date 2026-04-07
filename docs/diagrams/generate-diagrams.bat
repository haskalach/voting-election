@echo off
REM Generate PNG diagrams from Mermaid source files

cd /d "%~dp0"

REM Check if mmdc is installed
where mmdc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing @mermaid-js/mermaid-cli...
    call npm install
)

echo Generating diagram PNG files...

REM Generate each diagram
call mmdc -i 01-system-architecture.mmd -o 01-system-architecture.png -t dark
call mmdc -i 02-database-erd.mmd -o 02-database-erd.png -t dark
call mmdc -i 03-auth-flow.mmd -o 03-auth-flow.png -t dark
call mmdc -i 04-rbac-flow.mmd -o 04-rbac-flow.png -t dark
call mmdc -i 05-deployment-architecture.mmd -o 05-deployment-architecture.png -t dark
call mmdc -i 06-frontend-architecture.mmd -o 06-frontend-architecture.png -t dark

echo.
echo Diagram generation complete!
echo PNG files created:
dir /b *.png

pause
