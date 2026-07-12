(function() {
    'use strict';

    if (document.getElementById('chunchun-panel-container')) {
        console.log('[纯纯面板] 已存在，跳过注入');
        return;
    }

    console.log('[纯纯面板] 开始注入...');

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

function setInputText(text) {
    let attempts = 0;
    const maxAttempts = 30; // 3秒（30 * 100ms）

    function tryInsert() {
        try {
            const textarea = document.querySelector('#send_textarea');
            if (textarea) {
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();
                console.log('[纯纯面板] ✅ 已插入输入框');
                return true;
            }

            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx && ctx.setInputText) {
                    ctx.setInputText(text);
                    console.log('[纯纯面板] ✅ 已通过API插入');
                    return true;
                }
            }

            attempts++;
            if (attempts < maxAttempts) {
                console.log(`[纯纯面板] 等待输入框... (${attempts}/${maxAttempts})`);
                setTimeout(tryInsert, 100);
                return false;
            }

            navigator.clipboard.writeText(text).catch(() => {
                prompt('请手动复制以下内容：', text);
            });
            console.warn('[纯纯面板] ⚠️ 超时未找到输入框，已复制到剪贴板');
            return false;
        } catch (e) {
            console.error('[纯纯面板] 插入失败:', e);
            prompt('请手动复制以下内容：', text);
            return false;
        }
    }

    tryInsert();
}

    function buildStatusText(data) {
        return [
            '【{{user}}状态面板】',
            `时间地点：${data.time || ''}`,
            `我的服装：${data.clothes || ''}`,
            `情绪状态：${data.mood || ''}`,
            `随身携带：${data.items || ''}`
        ].join('\n') + '\n'+ '\n';
    }

    function createUI() {
        if (document.getElementById('chunchun-panel-container')) {
            return;
        }

        const data = loadData();

        let container;
        if (typeof $ !== 'undefined' && $.fn && $.fn.appendTo) {
            container = $('<div>')
                .attr('id', 'chunchun-panel-container')
                .attr('script_id', typeof getScriptId === 'function' ? getScriptId() : '')
                .css({
                    position: 'fixed',
                    bottom: '120px',
                    right: '30px',
                    zIndex: '999999',
                    fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
                    pointerEvents: 'none',
                    display: 'block',
                    visibility: 'visible',
                    opacity: '1'
                })
                .appendTo('body')[0];
        } else {
            container = document.createElement('div');
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
            document.body.appendChild(container);
        }

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
        title.textContent = '🌸 我的状态面板 v1.0';

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

        const updateBtn = document.createElement('button');
        updateBtn.textContent = '✨ 更新 ✨';
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
                this.textContent = '✨ 更新 ✨';
            }, 1200);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const active = document.activeElement;
                if (active && active.closest('#chunchun-panel')) {
                    e.preventDefault();
                    updateBtn.click();
                }
            }
        });

        panel.appendChild(title);
        panel.appendChild(fieldContainer);
        panel.appendChild(updateBtn);
        container.appendChild(panel);

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(createUI, 300);
        });
    } else {
        setTimeout(createUI, 300);
    }

})();