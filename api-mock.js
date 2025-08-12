// 纯前端API模拟 - 用于静态部署
class MockAPI {
    constructor() {
        this.mockData = {
            'https://example.com': {
                html: `
                    <div class="container">
                        <h1>示例网页标题</h1>
                        <p>这是一段示例文本内容，用于演示爬虫功能。</p>
                        <img src="https://via.placeholder.com/300x200" alt="示例图片" />
                        <a href="https://example.com/page1">示例链接1</a>
                        <div class="content">
                            <h2>子标题</h2>
                            <p>更多示例内容，展示不同类型的元素。</p>
                            <a href="https://example.com/page2">示例链接2</a>
                        </div>
                        <ul>
                            <li>列表项目1</li>
                            <li>列表项目2</li>
                            <li>列表项目3</li>
                        </ul>
                    </div>
                `,
                results: [
                    {
                        '标题': '示例网页标题',
                        '内容': '这是一段示例文本内容，用于演示爬虫功能。',
                        '链接': 'https://example.com/page1'
                    },
                    {
                        '标题': '子标题',
                        '内容': '更多示例内容，展示不同类型的元素。',
                        '链接': 'https://example.com/page2'
                    }
                ]
            },
            'https://news.example.com': {
                html: `
                    <div class="news-container">
                        <article class="news-item">
                            <h2>新闻标题1</h2>
                            <p>新闻内容摘要1...</p>
                            <img src="https://via.placeholder.com/400x250" alt="新闻图片1" />
                            <a href="/news/1">阅读全文</a>
                        </article>
                        <article class="news-item">
                            <h2>新闻标题2</h2>
                            <p>新闻内容摘要2...</p>
                            <img src="https://via.placeholder.com/400x250" alt="新闻图片2" />
                            <a href="/news/2">阅读全文</a>
                        </article>
                    </div>
                `,
                results: [
                    {
                        '新闻标题': '新闻标题1',
                        '摘要': '新闻内容摘要1...',
                        '图片': 'https://via.placeholder.com/400x250',
                        '链接': '/news/1'
                    },
                    {
                        '新闻标题': '新闻标题2',
                        '摘要': '新闻内容摘要2...',
                        '图片': 'https://via.placeholder.com/400x250',
                        '链接': '/news/2'
                    }
                ]
            }
        };
    }

    // 模拟预览API
    async preview(url) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockSite = this.mockData[url] || this.mockData['https://example.com'];
                resolve({
                    success: true,
                    html: mockSite.html
                });
            }, 1000); // 模拟网络延迟
        });
    }

    // 模拟爬取API
    async scrape(url, selections) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockSite = this.mockData[url] || this.mockData['https://example.com'];
                
                // 根据选择的元素生成模拟结果
                const results = mockSite.results.map((item, index) => {
                    const result = {};
                    selections.forEach(selection => {
                        switch(selection.type) {
                            case 'text':
                                result[selection.name] = Object.values(item).find(val => 
                                    typeof val === 'string' && !val.startsWith('http')
                                ) || `模拟文本内容 ${index + 1}`;
                                break;
                            case 'image':
                                result[selection.name] = Object.values(item).find(val => 
                                    typeof val === 'string' && val.includes('placeholder')
                                ) || 'https://via.placeholder.com/300x200';
                                break;
                            case 'link':
                                result[selection.name] = Object.values(item).find(val => 
                                    typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))
                                ) || 'https://example.com';
                                break;
                            default:
                                result[selection.name] = `模拟${selection.type}数据 ${index + 1}`;
                        }
                    });
                    return result;
                });

                resolve({
                    success: true,
                    results: results
                });
            }, 1500); // 模拟爬取延迟
        });
    }

    // 检查是否为演示模式
    isDemoMode() {
        return true;
    }
}

// 全局API实例
window.mockAPI = new MockAPI();

// 显示演示模式提示
function showDemoNotice() {
    const notice = document.createElement('div');
    notice.id = 'demo-notice';
    notice.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            text-align: center;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
            <span>🚀 演示模式 - 使用模拟数据展示功能</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 4px 8px;
                margin-left: 10px;
                border-radius: 4px;
                cursor: pointer;
            ">×</button>
        </div>
    `;
    document.body.appendChild(notice);
}

// 页面加载完成后显示演示提示
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showDemoNotice);
} else {
    showDemoNotice();
}