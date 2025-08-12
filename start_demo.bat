@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    网页爬虫工具 - 演示版本
echo ========================================
echo.
echo 正在启动演示服务器...
echo.
echo 💡 这是一个演示版本，展示前端界面效果
echo 🔧 要使用完整功能，请先安装 Node.js
echo 📖 详细安装说明请查看 INSTALL.md 文件
echo.
echo 启动后请在浏览器中访问: http://localhost:8000
echo.
echo 按任意键开始启动服务器...
pause >nul
echo.
python demo_server.py
echo.
echo 服务器已停止。
echo 按任意键退出...
pause >nul