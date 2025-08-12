// 全局变量
let selectedElements = [];
let currentUrl = '';
let selectionCounter = 0;

// DOM元素引用
const urlInput = document.getElementById('urlInput');
const previewBtn = document.getElementById('previewBtn');
const previewContainer = document.getElementById('previewContainer');
const selectionList = document.getElementById('selectionList');
const clearSelectionsBtn = document.getElementById('clearSelections');
const startScrapingBtn = document.getElementById('startScraping');
const refreshPreviewBtn = document.getElementById('refreshPreview');
const loadingOverlay = document.getElementById('loadingOverlay');
const urlError = document.getElementById('urlError');
const resultModal = document.getElementById('resultModal');
const nameModal = document.getElementById('nameModal');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateUI();
});

// 初始化事件监听器
function initializeEventListeners() {
    // URL输入和预览
    urlInput.addEventListener('input', validateUrl);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            previewWebpage();
        }
    });
    previewBtn.addEventListener('click', previewWebpage);
    refreshPreviewBtn.addEventListener('click', previewWebpage);

    // 选择操作
    clearSelectionsBtn.addEventListener('click', clearAllSelections);
    startScrapingBtn.addEventListener('click', startScraping);

    // 模态框
    document.getElementById('closeModal').addEventListener('click', closeResultModal);
    document.getElementById('cancelName').addEventListener('click', closeNameModal);
    document.getElementById('confirmName').addEventListener('click', confirmElementName);
    
    // 下载按钮
    document.getElementById('downloadCSV').addEventListener('click', () => downloadResults('csv'));
    document.getElementById('downloadJSON').addEventListener('click', () => downloadResults('json'));

    // 点击模态框外部关闭
    resultModal.addEventListener('click', function(e) {
        if (e.target === resultModal) {
            closeResultModal();
        }
    });
    
    nameModal.addEventListener('click', function(e) {
        if (e.target === nameModal) {
            closeNameModal();
        }
    });
}

// URL验证
function validateUrl() {
    const url = urlInput.value.trim();
    const urlPattern = /^https?:\/\/.+/;
    
    if (url && !urlPattern.test(url)) {
        showError('请输入有效的网页地址（包含 http:// 或 https://）');
        return false;
    } else {
        hideError();
        return true;
    }
}

// 显示错误信息
function showError(message) {
    urlError.textContent = message;
    urlError.style.display = 'block';
}

// 隐藏错误信息
function hideError() {
    urlError.style.display = 'none';
}

// 预览网页
async function previewWebpage() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('请输入网页地址');
        return;
    }
    
    if (!validateUrl()) {
        return;
    }
    
    showLoading('正在加载网页预览...');
    
    try {
        let data;
        
        // 检查是否有模拟API可用（静态部署模式）
        if (window.mockAPI && window.mockAPI.isDemoMode()) {
            data = await window.mockAPI.preview(url);
        } else {
            // 尝试使用真实API
            const response = await fetch('/api/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });
            data = await response.json();
        }
        
        if (data.success) {
            currentUrl = url;
            displayPreview(data.html);
            refreshPreviewBtn.disabled = false;
        } else {
            showError(data.error || '预览失败，请检查网页地址');
        }
    } catch (error) {
        console.error('预览错误:', error);
        // 如果真实API失败，尝试使用模拟API
        if (window.mockAPI) {
            try {
                const data = await window.mockAPI.preview(url);
                if (data.success) {
                    currentUrl = url;
                    displayPreview(data.html);
                    refreshPreviewBtn.disabled = false;
                    return;
                }
            } catch (mockError) {
                console.error('模拟API也失败:', mockError);
            }
        }
        showError('网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 显示预览内容
function displayPreview(html) {
    previewContainer.innerHTML = `
        <div class="preview-content">
            ${html}
        </div>
    `;
    
    // 为预览内容中的元素添加选择功能
    addSelectableElements();
}

// 为元素添加可选择功能
function addSelectableElements() {
    const previewContent = previewContainer.querySelector('.preview-content');
    if (!previewContent) return;
    
    // 为文本元素添加选择功能
    const textElements = previewContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, td, th, li');
    textElements.forEach(element => {
        if (element.textContent.trim() && !element.querySelector('img')) {
            makeElementSelectable(element, 'text');
        }
    });
    
    // 为图片添加选择功能
    const images = previewContent.querySelectorAll('img');
    images.forEach(img => {
        makeElementSelectable(img, 'image');
    });
    
    // 为链接添加选择功能
    const links = previewContent.querySelectorAll('a[href]');
    links.forEach(link => {
        makeElementSelectable(link, 'link');
    });
}

// 使元素可选择
function makeElementSelectable(element, type) {
    element.classList.add('selectable-element');
    element.dataset.elementType = type;
    
    element.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        selectElement(element, type);
    });
}

// 选择元素
function selectElement(element, type) {
    if (element.classList.contains('selected')) {
        return;
    }
    
    // 获取元素信息
    let content = '';
    let selector = generateSelector(element);
    
    switch (type) {
        case 'text':
            content = element.textContent.trim();
            break;
        case 'image':
            content = element.src || element.getAttribute('data-src') || '';
            break;
        case 'link':
            content = element.href;
            break;
    }
    
    if (!content) {
        showError('无法获取元素内容');
        return;
    }
    
    // 标记为已选择
    element.classList.add('selected');
    selectionCounter++;
    
    // 添加选择标记
    const badge = document.createElement('div');
    badge.className = 'selection-badge';
    badge.textContent = selectionCounter;
    element.style.position = 'relative';
    element.appendChild(badge);
    
    // 打开命名模态框
    openNameModal(element, type, content, selector);
}

// 生成CSS选择器
function generateSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }
    
    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
        const classes = element.className.split(' ').filter(c => c && !c.includes('selectable') && !c.includes('selected'));
        if (classes.length > 0) {
            selector += '.' + classes.join('.');
        }
    }
    
    // 添加位置信息
    const parent = element.parentElement;
    if (parent) {
        const siblings = Array.from(parent.children).filter(child => child.tagName === element.tagName);
        if (siblings.length > 1) {
            const index = siblings.indexOf(element) + 1;
            selector += `:nth-of-type(${index})`;
        }
    }
    
    return selector;
}

// 打开命名模态框
function openNameModal(element, type, content, selector) {
    const elementNameInput = document.getElementById('elementName');
    const elementTypeSelect = document.getElementById('elementType');
    
    // 设置默认值
    elementNameInput.value = '';
    elementTypeSelect.value = type;
    
    // 存储当前选择的元素信息
    nameModal.dataset.elementData = JSON.stringify({
        element: element,
        type: type,
        content: content,
        selector: selector
    });
    
    nameModal.classList.add('show');
    elementNameInput.focus();
}

// 确认元素命名
function confirmElementName() {
    const elementName = document.getElementById('elementName').value.trim();
    const elementType = document.getElementById('elementType').value;
    
    if (!elementName) {
        alert('请输入元素名称');
        return;
    }
    
    const elementData = JSON.parse(nameModal.dataset.elementData);
    
    // 添加到选择列表
    const selection = {
        id: Date.now(),
        name: elementName,
        type: elementType,
        content: elementData.content,
        selector: elementData.selector,
        element: elementData.element
    };
    
    selectedElements.push(selection);
    updateSelectionList();
    updateUI();
    
    closeNameModal();
}

// 关闭命名模态框
function closeNameModal() {
    nameModal.classList.remove('show');
    
    // 如果用户取消命名，移除选择状态
    if (nameModal.dataset.elementData) {
        try {
            const elementData = JSON.parse(nameModal.dataset.elementData);
            const element = elementData.element;
            
            // 检查element是否存在且仍在DOM中
            if (element && element.parentNode && typeof element.classList !== 'undefined') {
                element.classList.remove('selected');
                const badge = element.querySelector('.selection-badge');
                if (badge && typeof badge.remove === 'function') {
                    badge.remove();
                }
            }
            selectionCounter--;
        } catch (error) {
            console.warn('关闭命名模态框时出现错误:', error);
            // 即使出错也要减少计数器
            selectionCounter--;
        }
        
        // 清除数据
        delete nameModal.dataset.elementData;
    }
}

// 更新选择列表显示
function updateSelectionList() {
    if (selectedElements.length === 0) {
        selectionList.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="#C7C7CC" stroke-width="2" stroke-dasharray="4 4"/>
                    <path d="M24 16V32M16 24H32" stroke="#C7C7CC" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <p>暂无选择的内容</p>
                <span>在右侧预览中点击元素来选择</span>
            </div>
        `;
        return;
    }
    
    const listHTML = selectedElements.map(selection => `
        <div class="selection-item" data-id="${selection.id}">
            <div class="selection-info">
                <div class="selection-name">${selection.name}</div>
                <div class="selection-type">${getTypeLabel(selection.type)}</div>
            </div>
            <div class="selection-actions">
                <button class="btn-icon" onclick="removeSelection(${selection.id})" title="删除">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    selectionList.innerHTML = listHTML;
}

// 获取类型标签
function getTypeLabel(type) {
    const labels = {
        'text': '文本',
        'image': '图片',
        'link': '链接'
    };
    return labels[type] || type;
}

// 移除选择
function removeSelection(id) {
    const index = selectedElements.findIndex(s => s.id === id);
    if (index > -1) {
        const selection = selectedElements[index];
        
        // 移除元素的选择状态
        if (selection.element && selection.element.parentNode && typeof selection.element.classList !== 'undefined') {
            selection.element.classList.remove('selected');
            const badge = selection.element.querySelector('.selection-badge');
            if (badge && typeof badge.remove === 'function') {
                badge.remove();
            }
        }
        
        selectedElements.splice(index, 1);
        updateSelectionList();
        updateUI();
    }
}

// 清空所有选择
function clearAllSelections() {
    selectedElements.forEach(selection => {
        if (selection.element && selection.element.parentNode && typeof selection.element.classList !== 'undefined') {
            selection.element.classList.remove('selected');
            const badge = selection.element.querySelector('.selection-badge');
            if (badge && typeof badge.remove === 'function') {
                badge.remove();
            }
        }
    });
    
    selectedElements = [];
    selectionCounter = 0;
    updateSelectionList();
    updateUI();
}

// 开始爬取
async function startScraping() {
    if (selectedElements.length === 0) {
        alert('请先选择要爬取的内容');
        return;
    }
    
    showLoading('正在爬取数据...');
    
    try {
        let data;
        
        // 检查是否有模拟API可用（静态部署模式）
        if (window.mockAPI && window.mockAPI.isDemoMode()) {
            data = await window.mockAPI.scrape(currentUrl, selectedElements.map(s => ({
                name: s.name,
                type: s.type,
                selector: s.selector
            })));
        } else {
            // 尝试使用真实API
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: currentUrl,
                    selections: selectedElements.map(s => ({
                        name: s.name,
                        type: s.type,
                        selector: s.selector
                    }))
                })
            });
            data = await response.json();
        }
        
        if (data.success) {
            showResults(data.results);
        } else {
            alert(data.error || '爬取失败，请稍后重试');
        }
    } catch (error) {
        console.error('爬取错误:', error);
        // 如果真实API失败，尝试使用模拟API
        if (window.mockAPI) {
            try {
                const data = await window.mockAPI.scrape(currentUrl, selectedElements.map(s => ({
                    name: s.name,
                    type: s.type,
                    selector: s.selector
                })));
                if (data.success) {
                    showResults(data.results);
                    return;
                }
            } catch (mockError) {
                console.error('模拟API也失败:', mockError);
            }
        }
        alert('网络错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 显示结果
function showResults(results) {
    const resultContent = document.getElementById('resultContent');
    
    if (!results || results.length === 0) {
        resultContent.innerHTML = '<p>未找到匹配的数据</p>';
    } else {
        // 创建结果表格
        const headers = Object.keys(results[0]);
        const tableHTML = `
            <table class="result-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${results.map(row => `
                        <tr>
                            ${headers.map(header => {
                                const value = row[header];
                                if (typeof value === 'string' && (value.startsWith('http') && (value.includes('.jpg') || value.includes('.png') || value.includes('.gif') || value.includes('.jpeg')))) {
                                    return `<td><img src="${value}" alt="图片" /></td>`;
                                }
                                return `<td>${value || ''}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        resultContent.innerHTML = tableHTML;
    }
    
    // 存储结果用于下载
    window.scrapingResults = results;
    
    resultModal.classList.add('show');
}

// 关闭结果模态框
function closeResultModal() {
    resultModal.classList.remove('show');
}

// 下载结果
function downloadResults(format) {
    if (!window.scrapingResults) {
        alert('没有可下载的数据');
        return;
    }
    
    const results = window.scrapingResults;
    let content, filename, mimeType;
    
    if (format === 'csv') {
        content = convertToCSV(results);
        filename = 'scraping_results.csv';
        mimeType = 'text/csv';
    } else if (format === 'json') {
        content = JSON.stringify(results, null, 2);
        filename = 'scraping_results.json';
        mimeType = 'application/json';
    }
    
    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 转换为CSV格式
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
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
    
    return csvContent;
}

// 显示加载状态
function showLoading(message = '正在处理中...') {
    loadingOverlay.querySelector('p').textContent = message;
    loadingOverlay.classList.add('show');
}

// 隐藏加载状态
function hideLoading() {
    loadingOverlay.classList.remove('show');
}

// 更新UI状态
function updateUI() {
    const hasSelections = selectedElements.length > 0;
    const hasUrl = currentUrl !== '';
    
    clearSelectionsBtn.disabled = !hasSelections;
    startScrapingBtn.disabled = !hasSelections || !hasUrl;
}

// 全局函数（供HTML调用）
window.removeSelection = removeSelection;