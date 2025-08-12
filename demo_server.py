#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单的演示服务器
用于在没有Node.js环境时展示前端界面
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs
import threading
import time

PORT = 8000

class DemoHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_POST(self):
        """处理POST请求"""
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        if self.path == '/api/preview':
            self.handle_preview(data)
        elif self.path == '/api/scrape':
            self.handle_scrape(data)
        else:
            self.send_error(404, "API not found")
    
    def handle_preview(self, data):
        """处理预览请求"""
        url = data.get('url', '')
        
        # 模拟预览响应
        demo_html = f"""
        <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background: #f0f8ff; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #007AFF;">
                <h3 style="margin: 0 0 10px 0; color: #007AFF;">🚀 演示模式</h3>
                <p style="margin: 0; color: #666;">这是一个演示界面。要使用完整功能，请安装 Node.js 环境。</p>
            </div>
            
            <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">示例网页内容</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 20px 0;">
                <h3 style="color: #007AFF; margin-top: 0;">产品标题示例</h3>
                <p style="color: #666; line-height: 1.6;">这是一段示例文本内容，您可以点击选择此文本进行爬取。在真实环境中，这里会显示目标网页的实际内容。</p>
                
                <div style="display: flex; gap: 20px; margin: 20px 0; align-items: center;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iOCIgZmlsbD0iIzAwN0FGRiIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuekuuS+i+WbvueJhzwvdGV4dD4KPC9zdmc+" 
                         alt="示例图片" 
                         style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                    
                    <div>
                        <div style="font-size: 24px; font-weight: bold; color: #FF3B30; margin-bottom: 5px;">¥299.00</div>
                        <div style="font-size: 14px; color: #999; text-decoration: line-through;">原价: ¥399.00</div>
                    </div>
                </div>
                
                <a href="#" style="color: #007AFF; text-decoration: none; font-weight: 500;">查看详情 →</a>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #333;">产品特性</h4>
                <ul style="margin: 0; padding-left: 20px; color: #666;">
                    <li>高品质材料制作</li>
                    <li>现代简约设计</li>
                    <li>多种颜色可选</li>
                    <li>全国包邮服务</li>
                </ul>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong style="color: #856404;">💡 使用提示：</strong>
                <p style="margin: 5px 0 0 0; color: #856404;">在真实环境中，您可以点击页面中的任何文本、图片或链接来选择要爬取的内容。</p>
            </div>
        </div>
        """
        
        response = {
            "success": True,
            "html": demo_html,
            "url": url
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def handle_scrape(self, data):
        """处理爬取请求"""
        # 模拟爬取结果
        demo_results = [
            {
                "产品标题": "示例产品 1",
                "价格": "¥299.00",
                "图片": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iNCIgZmlsbD0iIzAwN0FGRiIvPgo8dGV4dCB4PSIyNSIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbvjE8L3RleHQ+Cjwvc3ZnPg==",
                "链接": "https://example.com/product1"
            },
            {
                "产品标题": "示例产品 2",
                "价格": "¥399.00",
                "图片": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iNCIgZmlsbD0iI0ZGM0IzMCIvPgo8dGV4dCB4PSIyNSIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbvjI8L3RleHQ+Cjwvc3ZnPg==",
                "链接": "https://example.com/product2"
            },
            {
                "产品标题": "示例产品 3",
                "价格": "¥199.00",
                "图片": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiByeD0iNCIgZmlsbD0iIzMwRDE1OCIvPgo8dGV4dCB4PSIyNSIgeT0iMzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuWbvjM8L3RleHQ+Cjwvc3ZnPg==",
                "链接": "https://example.com/product3"
            }
        ]
        
        # 模拟处理延迟
        time.sleep(1)
        
        response = {
            "success": True,
            "results": demo_results,
            "count": len(demo_results)
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        """处理CORS预检请求"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def start_server():
    """启动服务器"""
    with socketserver.TCPServer(("", PORT), DemoHandler) as httpd:
        print(f"\n🚀 演示服务器已启动")
        print(f"📱 访问地址: http://localhost:{PORT}")
        print(f"⏰ 启动时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"\n💡 这是一个演示版本，展示前端界面效果")
        print(f"🔧 要使用完整功能，请安装 Node.js 环境")
        print(f"📖 详细安装说明请查看 INSTALL.md 文件")
        print(f"\n按 Ctrl+C 停止服务器\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 服务器已停止")
            httpd.shutdown()

if __name__ == "__main__":
    start_server()