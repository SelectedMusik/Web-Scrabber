const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// 全局浏览器实例
let browser = null;

// 初始化浏览器
async function initBrowser() {
    try {
        // 检测是否在Vercel环境中
        const isVercel = process.env.VERCEL || process.env.NOW_REGION;
        
        if (isVercel) {
            // Vercel环境配置
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });
        } else {
            // 本地开发环境配置
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
        }
        console.log('浏览器初始化成功');
    } catch (error) {
        console.error('浏览器初始化失败:', error);
    }
}

// 获取浏览器实例
async function getBrowser() {
    if (!browser) {
        await initBrowser();
    }
    return browser;
}

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 网页预览API
app.post('/api/preview', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.json({ success: false, error: '请提供网页地址' });
        }
        
        // 验证URL格式
        if (!isValidUrl(url)) {
            return res.json({ success: false, error: '无效的网页地址' });
        }
        
        console.log('开始预览网页:', url);
        
        const browserInstance = await getBrowser();
        const page = await browserInstance.newPage();
        
        // 设置用户代理和视口
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1200, height: 800 });
        
        // 设置超时时间
        page.setDefaultTimeout(30000);
        
        try {
            // 访问页面
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            
            // 等待页面加载完成
            await page.waitForTimeout(2000);
            
            // 获取页面HTML内容
            const html = await page.content();
            
            // 使用cheerio处理HTML，移除脚本和样式
            const $ = cheerio.load(html);
            
            // 移除不需要的元素
            $('script, noscript, style, iframe, embed, object').remove();
            
            // 移除事件处理器属性
            $('*').each(function() {
                const element = $(this);
                const attributes = this.attribs;
                
                Object.keys(attributes).forEach(attr => {
                    if (attr.startsWith('on') || attr === 'href' && element.is('a')) {
                        if (attr === 'href' && element.is('a')) {
                            // 保留href但禁用链接
                            element.attr('onclick', 'return false;');
                        } else {
                            element.removeAttr(attr);
                        }
                    }
                });
            });
            
            // 添加基础样式
            const baseStyles = `
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        margin: 20px;
                        background: white;
                    }
                    img { 
                        max-width: 100%; 
                        height: auto;
                        border-radius: 6px;
                    }
                    a { 
                        color: #007AFF;
                        text-decoration: none;
                        pointer-events: none;
                    }
                    .selectable-element {
                        cursor: pointer;
                        transition: all 0.2s ease;
                        border-radius: 4px;
                        padding: 2px;
                    }
                    .selectable-element:hover {
                        background: rgba(0, 122, 255, 0.1) !important;
                        outline: 2px solid #007AFF;
                        outline-offset: 2px;
                    }
                    .selectable-element.selected {
                        background: rgba(0, 122, 255, 0.2) !important;
                        outline: 2px solid #007AFF;
                        outline-offset: 2px;
                    }
                    .selection-badge {
                        position: absolute;
                        top: -8px;
                        right: -8px;
                        background: #007AFF;
                        color: white;
                        border-radius: 50%;
                        width: 20px;
                        height: 20px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 12px;
                        font-weight: 600;
                        z-index: 10;
                    }
                </style>
            `;
            
            $('head').append(baseStyles);
            
            const processedHtml = $.html();
            
            await page.close();
            
            res.json({ 
                success: true, 
                html: processedHtml,
                url: url
            });
            
        } catch (pageError) {
            await page.close();
            console.error('页面加载错误:', pageError);
            res.json({ 
                success: false, 
                error: '无法加载该网页，请检查网址是否正确或网站是否可访问' 
            });
        }
        
    } catch (error) {
        console.error('预览错误:', error);
        res.json({ 
            success: false, 
            error: '服务器错误，请稍后重试' 
        });
    }
});

// 网页爬取API
app.post('/api/scrape', async (req, res) => {
    try {
        const { url, selections } = req.body;
        
        if (!url || !selections || selections.length === 0) {
            return res.json({ success: false, error: '请提供网页地址和选择的元素' });
        }
        
        console.log('开始爬取网页:', url);
        console.log('选择的元素:', selections);
        
        const browserInstance = await getBrowser();
        const page = await browserInstance.newPage();
        
        // 设置用户代理和视口
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1200, height: 800 });
        
        try {
            // 访问页面
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
            
            // 等待页面加载完成
            await page.waitForTimeout(3000);
            
            // 执行爬取
            const results = await page.evaluate((selections) => {
                const data = [];
                
                // 对于每个选择的元素类型，尝试找到所有匹配的元素
                const maxElements = Math.max(...selections.map(selection => {
                    const elements = document.querySelectorAll(selection.selector);
                    return elements.length;
                }));
                
                // 如果没有找到任何元素，至少尝试获取一行数据
                const rowCount = Math.max(1, maxElements);
                
                for (let i = 0; i < rowCount; i++) {
                    const row = {};
                    
                    selections.forEach(selection => {
                        const elements = document.querySelectorAll(selection.selector);
                        const element = elements[i] || elements[0]; // 如果没有对应索引的元素，使用第一个
                        
                        let value = '';
                        
                        if (element) {
                            switch (selection.type) {
                                case 'text':
                                    value = element.textContent ? element.textContent.trim() : '';
                                    break;
                                case 'image':
                                    value = element.src || element.getAttribute('data-src') || element.getAttribute('data-lazy-src') || '';
                                    // 处理相对路径
                                    if (value && !value.startsWith('http')) {
                                        value = new URL(value, window.location.href).href;
                                    }
                                    break;
                                case 'link':
                                    value = element.href || '';
                                    break;
                                default:
                                    value = element.textContent ? element.textContent.trim() : '';
                            }
                        }
                        
                        row[selection.name] = value;
                    });
                    
                    // 只添加非空行
                    if (Object.values(row).some(val => val && val.trim())) {
                        data.push(row);
                    }
                }
                
                return data;
            }, selections);
            
            await page.close();
            
            console.log('爬取结果:', results);
            
            res.json({ 
                success: true, 
                results: results,
                count: results.length
            });
            
        } catch (pageError) {
            await page.close();
            console.error('爬取错误:', pageError);
            res.json({ 
                success: false, 
                error: '爬取失败，请检查选择的元素是否正确' 
            });
        }
        
    } catch (error) {
        console.error('爬取错误:', error);
        res.json({ 
            success: false, 
            error: '服务器错误，请稍后重试' 
        });
    }
});

// 下载CSV文件API
app.post('/api/download/csv', async (req, res) => {
    try {
        const { data, filename = 'scraping_results.csv' } = req.body;
        
        if (!data || data.length === 0) {
            return res.status(400).json({ error: '没有数据可下载' });
        }
        
        // 创建CSV内容
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    // 处理包含逗号或引号的值
                    if (value.toString().includes(',') || value.toString().includes('"')) {
                        return `"${value.toString().replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csvContent); // 添加BOM以支持中文
        
    } catch (error) {
        console.error('CSV下载错误:', error);
        res.status(500).json({ error: '下载失败' });
    }
});

// 下载Excel文件API
app.post('/api/download/excel', async (req, res) => {
    try {
        const { data, filename = 'scraping_results.xlsx' } = req.body;
        
        if (!data || data.length === 0) {
            return res.status(400).json({ error: '没有数据可下载' });
        }
        
        // 创建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        
        // 添加工作表
        XLSX.utils.book_append_sheet(wb, ws, '爬取结果');
        
        // 生成Excel文件
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(excelBuffer);
        
    } catch (error) {
        console.error('Excel下载错误:', error);
        res.status(500).json({ error: '下载失败' });
    }
});

// URL验证函数
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ 
        success: false, 
        error: '服务器内部错误' 
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        error: '接口不存在' 
    });
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    
    if (browser) {
        await browser.close();
        console.log('浏览器已关闭');
    }
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('收到SIGTERM信号，正在关闭服务器...');
    
    if (browser) {
        await browser.close();
        console.log('浏览器已关闭');
    }
    
    process.exit(0);
});

// 启动服务器
app.listen(PORT, async () => {
    console.log(`\n🚀 网页爬虫服务器已启动`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`⏰ 启动时间: ${new Date().toLocaleString()}`);
    console.log(`\n正在初始化浏览器...`);
    
    // 初始化浏览器
    await initBrowser();
    
    console.log(`\n✅ 服务器就绪，可以开始使用！`);
});