# 安装指南 📦

## 系统要求

在运行此网页爬虫应用之前，您需要安装以下软件：

### 1. 安装 Node.js

#### Windows 系统安装步骤：

1. **下载 Node.js**
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载 LTS（长期支持）版本
   - 选择 Windows Installer (.msi) 64-bit

2. **安装 Node.js**
   - 双击下载的 .msi 文件
   - 按照安装向导完成安装
   - 确保勾选 "Add to PATH" 选项

3. **验证安装**
   打开命令提示符或PowerShell，运行：
   ```bash
   node --version
   npm --version
   ```
   如果显示版本号，说明安装成功。

#### 其他安装方式：

**使用 Chocolatey（推荐）：**
```bash
# 首先安装 Chocolatey（如果未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装 Node.js
choco install nodejs
```

**使用 Winget：**
```bash
winget install OpenJS.NodeJS
```

### 2. 安装项目依赖

安装完 Node.js 后，在项目目录中运行：

```bash
npm install
```

### 3. 启动应用

```bash
npm start
```

然后在浏览器中访问：`http://localhost:3000`

## 故障排除

### 问题1：npm 命令不被识别
**解决方案：**
- 重启命令提示符/PowerShell
- 检查环境变量 PATH 中是否包含 Node.js 路径
- 重新安装 Node.js 并确保勾选 "Add to PATH"

### 问题2：安装依赖时出错
**解决方案：**
- 清除 npm 缓存：`npm cache clean --force`
- 删除 node_modules 文件夹和 package-lock.json
- 重新运行：`npm install`

### 问题3：Puppeteer 安装失败
**解决方案：**
- 设置 npm 镜像：`npm config set registry https://registry.npmmirror.com`
- 或使用 cnpm：`npm install -g cnpm --registry=https://registry.npmmirror.com`
- 然后使用：`cnpm install`

### 问题4：防火墙阻止
**解决方案：**
- 允许 Node.js 通过 Windows 防火墙
- 或临时关闭防火墙进行测试

## 开发环境设置

如果您想要修改代码，建议安装以下工具：

1. **代码编辑器**
   - [Visual Studio Code](https://code.visualstudio.com/)
   - [WebStorm](https://www.jetbrains.com/webstorm/)

2. **浏览器开发工具**
   - Chrome DevTools
   - Firefox Developer Tools

3. **版本控制**
   - [Git](https://git-scm.com/)

## 生产环境部署

### 使用 PM2（推荐）

1. 安装 PM2：
   ```bash
   npm install -g pm2
   ```

2. 启动应用：
   ```bash
   pm2 start server.js --name "web-scraper"
   ```

3. 设置开机自启：
   ```bash
   pm2 startup
   pm2 save
   ```

### 使用 Docker

1. 创建 Dockerfile：
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. 构建镜像：
   ```bash
   docker build -t web-scraper .
   ```

3. 运行容器：
   ```bash
   docker run -p 3000:3000 web-scraper
   ```

## 性能优化

### 服务器优化
- 增加内存限制：`node --max-old-space-size=4096 server.js`
- 使用集群模式：安装 `cluster` 模块
- 配置负载均衡

### 浏览器优化
- 定期重启 Puppeteer 实例
- 限制并发连接数
- 配置资源缓存

## 安全建议

1. **网络安全**
   - 使用 HTTPS（生产环境）
   - 配置 CORS 策略
   - 限制访问频率

2. **数据安全**
   - 不记录敏感信息
   - 定期清理临时文件
   - 加密存储配置

3. **系统安全**
   - 定期更新依赖包
   - 使用最新版本的 Node.js
   - 配置防火墙规则

---

如果您在安装过程中遇到任何问题，请参考 [README.md](README.md) 中的常见问题部分，或提交 Issue 获取帮助。