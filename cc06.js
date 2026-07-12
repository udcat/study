// ============================================================
// 纯纯状态面板 - 注册为酒馆扩展 (防清除) 完整版
// ============================================================

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

    // --- 插入酒馆输入框 ---
    function setInputText(text) {
        try {
            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx && ctx.setInputText) {
                    ctx.setInputText(text);
                    return;
                }
            }
            const textarea = document.querySelector('#send_textarea');
            if (textarea) {
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                alert('已复制到剪贴板，请手动粘贴到输入框');
            }).catch(() => {
                prompt('请手动复制以下内容：', text);
            });
        } catch (e) {
            console.error('[纯纯面板] 插入输入框失败:', e);
        }
    }

    // --- 构建状态文本 ---
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

    // --- 创建 UI（关键：加上 script_id） ---
    function createUI() {
        if (document.getElementById('chunchun-panel-container')) {
            console.log('[纯纯面板] 面板已存在，跳过创建');
            return;
        }

        const data = loadData();

        // 主容器，加上 script_id 护身符
        const container = document.createElement('div');
        container.id = 'chunchun-panel-container';
        if (typeof getScriptId === 'function') {
            container.setAttribute('script_id', getScriptId());
        }
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 30px;
            z-index: 999999;
            font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
            pointer-events: none;
            display: block;
            visibility: visible;
            opacity: 1;
        `;

        // 面板本身
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
            cursor: grab;
            user-select: none;
            color: #4a343a;
            transition: box-shadow 0.2s;
            position: relative;
        `;
        panel.title = '拖动面板';

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

        // 四个输入框
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

        updateBtn.addEventListener('click', function() {
            const currentData = {};
            fields.forEach(f => {
                currentData[f.key] = inputs[f.key].value.trim();
            });
            saveData(currentData);
            setInputText(buildStatusText(currentData));

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
        container.appendChild(panel);
        document.body.appendChild(container);

        // --- 拖拽 ---
        let isDragging = false;
        let startX, startY, originX, originY;

        function onDragStart(e) {
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

        panel.addEventListener('mousedown', onDragStart);

        // 窗口 resize 修正位置
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

    // --- 启动 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(createUI, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(createUI, 300);
        });
    }

})();