# 部署指南

## Vercel 部署

### 前提条件
1. 拥有 [Vercel](https://vercel.com) 账户
2. 安装 Vercel CLI：`npm i -g vercel`

### 部署步骤

#### 方法一：使用 Vercel CLI
```bash
# 1. 登录 Vercel
vercel login

# 2. 在项目目录中运行部署命令
vercel

# 3. 按照提示完成配置
# - 选择项目名称
# - 确认设置
# - 等待部署完成
```

#### 方法二：通过 GitHub 集成
1. 将代码推送到 GitHub 仓库
2. 在 Vercel 控制台中导入 GitHub 项目
3. Vercel 会自动检测配置并部署

### 配置说明

项目已包含以下配置文件：

- `vercel.json`: Vercel 部署配置
- `.vercelignore`: 排除不必要的文件
- 优化的 `package.json`: 使用 puppeteer-core 和 chrome-aws-lambda

### 环境变量

部署时会自动设置以下环境变量：
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`
- `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable`

### 注意事项

1. **函数超时**: Vercel 免费版函数执行时间限制为 10 秒，Pro 版为 60 秒
2. **内存限制**: 免费版内存限制为 1024MB
3. **并发限制**: 免费版并发执行限制为 1 个函数

### 故障排除

#### 部署失败
- 检查 `package.json` 中的依赖是否正确
- 确认 `vercel.json` 配置无误
- 查看 Vercel 控制台的构建日志

#### 运行时错误
- 检查浏览器初始化是否成功
- 确认网络请求是否正常
- 查看 Vercel 函数日志

### 本地测试

在部署前，建议先在本地测试：

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或使用 Node.js 直接运行
node server.js
```

### 生产环境优化

1. **缓存策略**: 考虑添加适当的缓存机制
2. **错误处理**: 完善错误处理和日志记录
3. **性能监控**: 使用 Vercel Analytics 监控性能
4. **安全性**: 添加适当的安全头和验证

## 其他部署平台

### Heroku
```bash
# 创建 Heroku 应用
heroku create your-app-name

# 设置环境变量
heroku config:set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
heroku config:set PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# 部署
git push heroku main
```

### Railway
1. 连接 GitHub 仓库
2. 选择项目
3. 自动部署

### 自托管
```bash
# 使用 PM2 管理进程
npm install -g pm2
pm2 start server.js --name "web-scraper"
pm2 startup
pm2 save
```

## 支持

如果遇到部署问题，请检查：
1. 项目配置文件
2. 依赖版本兼容性
3. 平台特定的限制和要求