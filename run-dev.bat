@echo off
cd /d "d:\sgs globe demo"
set NODE_PATH=%TEMP%\node-v20.11.0-win-x64\node.exe
set NPM_PATH=%TEMP%\node-v20.11.0-win-x64\npm.cmd

set PATH=%TEMP%\node-v20.11.0-win-x64;%PATH%

echo Starting dev server...
%NODE_PATH% node_modules\.bin\vite
