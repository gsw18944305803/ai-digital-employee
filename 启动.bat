@echo off
echo 启动数字员工...

echo.
echo 启动后端服务 (端口 8080)...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"

echo.
echo 启动前端服务 (端口 8088)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npx http-server -p 8088 -c-1"

echo.
echo ========================================
echo 数字员工已启动！
echo 前端: http://localhost:8088
echo 后端: http://localhost:8080
echo ========================================
echo.
echo 按任意键打开浏览器...
pause > nul

start http://localhost:8088
