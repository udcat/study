// ============================================================
// 纯纯状态面板 - ES Module 版 (仿潮汐模式)
// 功能：悬浮面板，可拖动，保存状态，点击更新插入输入框
// 使用方法：import '你的 Raw 链接';
// ============================================================

// 使用 IIFE 包裹，防止变量污染，并在导入时自动执行
(function() {
    'use strict';

    // 防止重复注入
    if (document.getElementById('chunchun-panel-container')) {
        console.log('[纯纯面板] 已存在，跳过注入');
        return;
    }

    console.log('[纯纯面板] 开始注入...');

    // --- 数据管理 ---
    const STORAGE_KEY = 'chunchun_panel_data';
    const defaultData = { time: '', clothes: '', mood: '', items: '' };

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...defaultData, ...parsed };
            }
        } catch (e) {}
        return { ...defaultData };
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    // --- 插入酒馆输入框 (兼容多种方式) ---
    function setInputText(text) {
        try {
            // 方法1：SillyTavern 官方 API (最可靠)
            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx && ctx.setInputText) {
                    ctx.setInputText(text);
                    return;
                }
            }
            // 方法2：直接操作 DOM (针对旧版或特定环境)
            const textarea = document.querySelector('#send_textarea');
            if (textarea) {
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();
                return;
            }
            // 方法3：终极保底 - 复制到剪贴板
            navigator.clipboard.writeText(text).then(() => {
                alert('已复制到剪贴板，请手动粘贴到输入框');
            }).catch(() => {
                prompt('请手动复制以下内容：', text);
            });
        } catch (e) {
            console.error('[纯纯面板] 插入输入框失败:', e);
        }
    }

    // --- 构建状态文本 (符合你的格式要求) ---
    function buildStatusText(data) {
        const lines = [
            '/setinput {{input}} ',
            '【纯纯状态面板】',
            `时间地点：${data.time || ''}`,
            `我的服装：${data.clothes || ''}`,
            `情绪状态：${data.mood || ''}`,
            `随身携带：${data.items || ''}`
        ];
        return lines.join('\n');
    }

    // --- 创建 UI ---
    function createUI() {
        // 再次检查是否已存在，防止重复创建
        if (document.getElementById('chunchun-panel-container')) {
            console.log('[纯纯面板] 面板已存在，跳过创建');
            return;
        }

        console.log('[纯纯面板] 开始创建面板...');

        const data = loadData();

        // 主容器 (用于定位整个面板)
        const container = document.createElement('div');
        container.id = 'chunchun-panel-container';
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 30px;
            z-index: 999999;
            font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
            pointer-events: none; /* 让容器不干扰鼠标事件，内部元素再开放 */
            cursor: default;
        `;

        // 面板本身 (可拖动)
        const panel = document.createElement('div');
        panel.id = 'chunchun-panel';
        panel.style.cssText = `
            pointer-events: auto;
            width: 280px;
            background: rgba(255, 245, 247, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 2px solid rgba(255, 182, 193, 0.6);
            border-radius: 24px;
            padding: 20px 18px 18px;
            box-shadow: 0 12px 40px rgba(211, 137, 156, 0.25), inset 0 2px 4px rgba(255,255,255,0.7);
            transition: box-shadow 0.2s;
            cursor: grab;
            user-select: none;
            color: #4a343a;
        `;
        panel.title = '拖动面板 (按住标题栏或空白区域)';

        // 标题
        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 18px;
            font-weight: 700;
            color: #b34b6a;
            text-align: center;
            margin-bottom: 16px;
            letter-spacing: 1px;
            border-bottom: 2px dashed rgba(255, 182, 193, 0.4);
            padding-bottom: 10px;
            cursor: grab;
        `;
        title.textContent = '🌸 我的状态面板';

        // 四个输入框组
        const fields = [
            { key: 'time', label: '📅 时间地点', placeholder: '例如：2013年11月4日 22:26 澜京大学' },
            { key: 'clothes', label: '👗 我的服装', placeholder: '例如：奶茶店制服' },
            { key: 'mood', label: '😊 情绪状态', placeholder: '例如：放松' },
            { key: 'items', label: '🎒 随身携带', placeholder: '例如：500元现金，手机，学生证' }
        ];

        const inputs = {};
        const fieldContainer = document.createElement('div');

        fields.forEach(f => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'margin-bottom: 10px;';

            const label = document.createElement('label');
            label.style.cssText = `
                display: block;
                font-size: 13px;
                font-weight: 600;
                color: #b34b6a;
                margin-bottom: 2px;
                letter-spacing: 0.3px;
                cursor: default;
            `;
            label.textContent = f.label;

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = f.placeholder;
            input.value = data[f.key] || '';
            input.style.cssText = `
                width: 100%;
                padding: 7px 14px;
                border: 2px solid rgba(255, 182, 193, 0.4);
                border-radius: 30px;
                background: rgba(255, 255, 255, 0.7);
                font-size: 13px;
                color: #4a343a;
                outline: none;
                transition: all 0.25s ease;
                box-sizing: border-box;
                font-family: inherit;
                user-select: text;
                cursor: text;
            `;
            input.addEventListener('focus', function() {
                this.style.borderColor = '#b34b6a';
                this.style.boxShadow = '0 0 0 4px rgba(179, 75, 106, 0.12)';
            });
            input.addEventListener('blur', function() {
                this.style.borderColor = 'rgba(255, 182, 193, 0.4)';
                this.style.boxShadow = 'none';
            });

            inputs[f.key] = input;
            wrapper.appendChild(label);
            wrapper.appendChild(input);
            fieldContainer.appendChild(wrapper);
        });

        // 更新按钮
        const updateBtn = document.createElement('button');
        updateBtn.textContent = '✨ 更新';
        updateBtn.style.cssText = `
            width: 100%;
            padding: 10px 0;
            margin-top: 6px;
            background: linear-gradient(135deg, #ffb3c1, #ff8da1);
            border: none;
            border-radius: 30px;
            color: white;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(255, 105, 135, 0.3);
            transition: all 0.25s ease;
            letter-spacing: 1px;
            font-family: inherit;
        `;
        updateBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 6px 24px rgba(255, 105, 135, 0.45)';
        });
        updateBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(255, 105, 135, 0.3)';
        });

        // 点击更新：保存数据 + 生成文本 + 插入输入框
        updateBtn.addEventListener('click', function() {
            const currentData = {};
            fields.forEach(f => {
                currentData[f.key] = inputs[f.key].value.trim();
            });
            saveData(currentData);
            const statusText = buildStatusText(currentData);
            setInputText(statusText);

            // 反馈
            this.textContent = '✅ 已插入！';
            setTimeout(() => {
                this.textContent = '✨ 更新';
            }, 1200);
        });

        // 回车触发更新
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                if (active && active.closest('#chunchun-panel')) {
                    e.preventDefault();
                    updateBtn.click();
                }
            }
        });

        // 组装面板
        panel.appendChild(title);
        panel.appendChild(fieldContainer);
        panel.appendChild(updateBtn);

        // 组装容器
        container.appendChild(panel);
        document.body.appendChild(container);

        // --- 拖拽功能 (整个面板可拖动) ---
        let isDragging = false;
        let startX, startY, originX, originY;

        function onDragStart(e) {
            // 如果点击的是输入框或按钮，不触发拖拽
            if (e.target.closest('input') || e.target.closest('button')) return;
            if (e.button !== 0) return;

            isDragging = true;
            const rect = panel.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            originX = rect.left;
            originY = rect.top;

            panel.style.cursor = 'grabbing';
            panel.style.transition = 'none';
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
            e.preventDefault();
        }

        function onDragMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = originX + dx;
            let newTop = originY + dy;

            // 边界约束 (防止拖出屏幕)
            const panelW = panel.offsetWidth;
            const panelH = panel.offsetHeight;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            newLeft = Math.max(0, Math.min(winW - panelW, newLeft));
            newTop = Math.max(0, Math.min(winH - panelH, newTop));

            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';
        }

        function onDragEnd() {
            if (isDragging) {
                isDragging = false;
                panel.style.cursor = 'grab';
                panel.style.transition = '';
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
            }
        }

        // 监听面板上的鼠标按下
        panel.addEventListener('mousedown', onDragStart);

        // 窗口大小变化时，如果面板超出边界，自动修正位置
        window.addEventListener('resize', function() {
            const rect = panel.getBoundingClientRect();
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            let left = rect.left;
            let top = rect.top;
            const pw = panel.offsetWidth;
            const ph = panel.offsetHeight;
            if (left + pw > winW) left = winW - pw;
            if (top + ph > winH) top = winH - ph;
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            container.style.left = left + 'px';
            container.style.top = top + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';
        });

        console.log('[纯纯面板] ✅ 注入成功！');
    }

    // --- 启动：等待 DOM 加载完成 ---
    if (document.readyState === 'complete') {
        // 如果页面已经加载，直接注入
        setTimeout(createUI, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(createUI, 300);
        });
    }

})(); // 结束 IIFE