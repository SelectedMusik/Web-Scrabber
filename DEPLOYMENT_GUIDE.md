# 网页爬虫应用部署指南

由于当前环境没有安装Node.js，无法直接使用命令行工具部署。以下是几种部署方案：

## 方案一：Vercel部署（推荐）

### 通过GitHub部署
1. 将项目上传到GitHub仓库
2. 访问 [vercel.com](https://vercel.com)
3. 使用GitHub账号登录
4. 点击"New Project"导入GitHub仓库
5. Vercel会自动检测项目配置并部署

### 通过拖拽部署
1. 访问 [vercel.com](https://vercel.com)
2. 登录后点击"New Project"
3. 选择"Browse all templates"下方的"Deploy"按钮
4. 将整个项目文件夹拖拽到部署区域
5. 等待自动部署完成

## 方案二：Netlify部署

### 通过拖拽部署
1. 访问 [netlify.com](https://netlify.com)
2. 注册/登录账号
3. 点击"Sites"页面的"Add new site" > "Deploy manually"
4. 将项目文件夹拖拽到部署区域
5. 等待部署完成

### 通过GitHub部署
1. 将项目上传到GitHub
2. 在Netlify中选择"Import from Git"
3. 连接GitHub并选择仓库
4. 配置构建设置（通常自动检测）
5. 点击"Deploy site"

## 方案三：GitHub Pages部署

1. 将项目上传到GitHub仓库
2. 进入仓库设置页面
3. 找到"Pages"选项
4. 选择"Deploy from a branch"
5. 选择"main"分支和"/ (root)"文件夹
6. 点击"Save"等待部署

## 当前项目特点

- ✅ 已配置为静态网站，无需服务器
- ✅ 包含vercel.json配置文件
- ✅ 使用模拟API，可完整演示功能
- ✅ 响应式设计，支持移动端
- ✅ 苹果风格UI设计

## 部署后功能

部署后的网站将包含以下功能：
- 网页URL输入和验证
- 网页内容预览（模拟）
- 元素选择和命名
- 数据爬取演示
- CSV/JSON格式导出
- 完整的用户界面交互

## 注意事项

1. **当前版本使用模拟数据**：由于部署环境限制，网页预览和爬取功能使用模拟数据演示
2. **完整功能需要Node.js环境**：要使用真实的网页爬取功能，需要在支持Node.js的环境中运行
3. **安全考虑**：生产环境建议添加适当的安全措施和访问控制

## 本地开发

如果需要完整功能的本地开发：

1. 安装Node.js（从 [nodejs.org](https://nodejs.org) 下载）
2. 运行 `npm install` 安装依赖
3. 运行 `npm start` 启动服务器
4. 访问 `http://localhost:3000`

## 技术支持

如需技术支持或有问题，请参考：
- README.md - 项目说明
- INSTALL.md - 安装指南
- 项目源代码注释

---

**推荐部署平台**：Vercel（最佳性能和CDN支持）
**备选方案**：Netlify、GitHub Pages
**本地演示**：使用 `start_demo.bat` 启动Python服务器