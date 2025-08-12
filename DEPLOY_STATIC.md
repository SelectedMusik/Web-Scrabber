# 静态版本部署指南

本项目已经配置为纯静态网站，可以部署到任何静态托管平台。

## 🚀 快速部署

### 方式一：Vercel 部署（推荐）

1. **在线部署**（无需安装任何工具）：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入此项目或上传项目文件
   - Vercel 会自动检测并部署

2. **使用 Vercel CLI**（需要 Node.js）：
   ```bash
   # 安装 Vercel CLI
   npm install -g vercel
   
   # 在项目目录中运行
   vercel
   
   # 按照提示完成部署
   ```

### 方式二：Netlify 部署

1. 访问 [netlify.com](https://netlify.com)
2. 拖拽项目文件夹到 Netlify 部署区域
3. 自动完成部署

### 方式三：GitHub Pages

1. 将项目上传到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支作为源

### 方式四：其他静态托管平台

- **Surge.sh**: `npm install -g surge && surge`
- **Firebase Hosting**: 使用 Firebase CLI
- **Cloudflare Pages**: 通过 Cloudflare 控制台

## 📁 项目文件说明

### 核心文件
- `index.html` - 主页面
- `styles.css` - 样式文件
- `script.js` - 主要 JavaScript 逻辑
- `api-mock.js` - 模拟 API 功能
- `vercel.json` - Vercel 部署配置
- `package.json` - 项目配置（已简化）

### 功能特点
- ✅ 纯前端实现，无需后端服务器
- ✅ 使用模拟数据演示爬虫功能
- ✅ 支持元素选择和命名
- ✅ 支持 CSV/JSON 数据导出
- ✅ 响应式设计，支持移动端

## 🎯 演示功能

由于是静态版本，本应用使用模拟数据来演示爬虫功能：

1. **网页预览**: 显示预设的示例网页内容
2. **元素选择**: 可以选择文本、图片、链接等元素
3. **数据爬取**: 生成模拟的爬取结果
4. **数据导出**: 支持下载 CSV 和 JSON 格式

## 🔧 本地测试

### 使用 Python（推荐）
```bash
# Python 3
python -m http.server 8000

# 或者使用项目中的演示服务器
python demo_server.py
```

### 使用 Node.js
```bash
# 安装简单的 HTTP 服务器
npm install -g http-server

# 启动服务器
http-server
```

### 使用 Live Server（VS Code 扩展）
1. 安装 Live Server 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 📝 注意事项

1. **演示模式**: 当前版本使用模拟数据，不会真正爬取网页
2. **CORS 限制**: 静态版本无法绕过浏览器的 CORS 限制
3. **功能限制**: 某些高级爬虫功能在静态版本中不可用

## 🔄 升级到完整版本

如需使用完整的爬虫功能，请：

1. 安装 Node.js 环境
2. 恢复完整的 `package.json` 依赖
3. 使用 `server.js` 启动后端服务
4. 参考 `README.md` 中的完整安装指南

## 🆘 故障排除

### 部署失败
- 检查所有文件是否完整
- 确认 `vercel.json` 配置正确
- 查看部署平台的错误日志

### 功能异常
- 确保浏览器支持 ES6+ 语法
- 检查浏览器控制台是否有错误
- 确认所有 JavaScript 文件已正确加载

### 样式问题
- 检查 `styles.css` 文件是否正确加载
- 确认没有 CSS 语法错误
- 验证响应式设计在不同设备上的表现

---

**部署成功后，您将获得一个可以在线访问的网页爬虫演示应用！** 🎉