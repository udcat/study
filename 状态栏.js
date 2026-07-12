// =============================================
// 纯纯状态面板 - ES Module 版 (适配 import)
// =============================================

(function() {
    'use strict';

    // 防重复注入
    if (document.getElementById('chunchun-container')) {
        console.log('[纯纯面板] 已注入，跳过');
        return;
    }

    console.log('[纯纯面板] 开始加载...');

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function setInputText(text) {
        try {
            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx && ctx.setInputText) {
                    ctx.setInputText(text);
                    return;
                }
            }
            const ta = document.querySelector('#send_textarea');
            if (ta) {
                ta.value = text;
                ta.dispatchEvent(new Event('input', { bubbles: true }));
                ta.focus();
                return;
            }
            navigator.clipboard.writeText(text).catch(() => {
                prompt('请手动复制：', text);
            });
        } catch (e) {
            console.error('[纯纯面板] 插入失败', e);
        }
    }

    function buildText(data) {
        return [
            '/setinput {{input}} ',
            '【纯纯状态面板】',
            '时间地点：' + (data.time || ''),
            '我的服装：' + (data.clothes || ''),
            '情绪状态：' + (data.mood || ''),
            '随身携带：' + (data.items || '')
        ].join('\n');
    }

    function injectUI() {
        if (!document.body) {
            setTimeout(injectUI, 200);
            return;
        }

        const data = loadData();

        const container = document.createElement('div');
        container.id = 'chunchun-container';
        container.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 24px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            pointer-events: none;
            font-family: "Microsoft YaHei", sans-serif;
        `;

        const panel = document.createElement('div');
        panel.id = 'chunchun-panel';
        panel.style.cssText = `
            pointer-events: auto;
            background: rgba(255,245,247,0.98);
            backdrop-filter: blur(12px);
            border: 2px solid #fbc4d0;
            border-radius: 18px;
            padding: 14px 16px;
            margin-bottom: 12px;
            width: 250px;
            box-shadow: 0 12px 32px rgba(211,137,156,0.25);
            transition: all 0.3s ease;
            transform: scale(0.9) translateY(10px);
            opacity: 0;
            visibility: hidden;
            transform-origin: bottom right;
            color: #4a343a;
            font-size: 13px;
            line-height: 1.8;
        `;

        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 15px;
            font-weight: bold;
            color: #b34b6a;
            margin-bottom: 8px;
            border-bottom: 1px dashed #fbc4d0;
            padding-bottom: 4px;
        `;
        title.textContent = '🌸 我的状态面板';

        const fields = [
            { key: 'time', label: '时间地点', placeholder: 'e.g. 下午3点 · 卧室' },
            { key: 'clothes', label: '我的服装', placeholder: 'e.g. 白衬衫' },
            { key: 'mood', label: '情绪状态', placeholder: 'e.g. 开心' },
            { key: 'items', label: '随身携带', placeholder: 'e.g. 手机' }
        ];
        const inputs = {};
        const fieldWrap = document.createElement('div');

        fields.forEach(f => {
            const row = document.createElement('div');
            row.style.cssText = 'display: flex; align-items: center; gap: 4px; margin-bottom: 4px;';
            const lbl = document.createElement('label');
            lbl.style.cssText = 'font-weight: 600; color: #b34b6a; font-size: 12px; min-width: 50px;';
            lbl.textContent = f.label + '：';
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.placeholder = f.placeholder;
            inp.value = data[f.key] || '';
            inp.style.cssText = `
                flex: 1;
                background: rgba(255,255,255,0.7);
                border: 1px solid #fbc4d0;
                border-radius: 30px;
                padding: 3px 10px;
                font-size: 12px;
                color: #333;
                outline: none;
            `;
            inp.addEventListener('focus', function() {
                this.style.borderColor = '#b34b6a';
                this.style.boxShadow = '0 0 0 3px rgba(179,75,106,0.12)';
            });
            inp.addEventListener('blur', function() {
                this.style.borderColor = '#fbc4d0';
                this.style.boxShadow = 'none';
            });
            inputs[f.key] = inp;
            row.appendChild(lbl);
            row.appendChild(inp);
            fieldWrap.appendChild(row);
        });

        const updateBtn = document.createElement('button');
        updateBtn.textContent = '✨ 更新';
        updateBtn.style.cssText = `
            width: 100%;
            padding: 5px 0;
            margin-top: 6px;
            background: linear-gradient(135deg, #ffb3c1, #ff8da1);
            border: none;
            border-radius: 30px;
            color: white;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255,105,135,0.3);
            transition: 0.2s;
        `;
        updateBtn.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.02)'; });
        updateBtn.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
        updateBtn.addEventListener('click', function() {
            const cur = {};
            fields.forEach(f => { cur[f.key] = inputs[f.key].value; });
            saveData(cur);
            setInputText(buildText(cur));
            this.textContent = '✅ 已插入！';
            setTimeout(() => { this.textContent = '✨ 更新'; }, 1000);
        });

        panel.appendChild(title);
        panel.appendChild(fieldWrap);
        panel.appendChild(updateBtn);

        const toggleBtn = document.createElement('div');
        toggleBtn.id = 'chunchun-toggle';
        toggleBtn.style.cssText = `
            pointer-events: auto;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffb3c1, #ff8da1);
            color: white;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            box-shadow: 0 6px 20px rgba(255,105,135,0.4);
            user-select: none;
            border: 3px solid rgba(255,255,255,0.6);
            transition: 0.2s;
            font-weight: bold;
            z-index: 999999;
        `;
        toggleBtn.textContent = '🐾';
        toggleBtn.title = '点击展开状态面板 (可拖动)';

        let isOpen = false;
        let isDragging = false;
        let offX = 0, offY = 0;

        toggleBtn.addEventListener('click', function(e) {
            if (isDragging) { isDragging = false; return; }
            isOpen = !isOpen;
            if (isOpen) {
                panel.style.transform = 'scale(1) translateY(0)';
                panel.style.opacity = '1';
                panel.style.visibility = 'visible';
            } else {
                panel.style.transform = 'scale(0.9) translateY(10px)';
                panel.style.opacity = '0';
                panel.style.visibility = 'hidden';
            }
        });

        const onStart = (e) => {
            const c = e.touches ? e.touches[0] : e;
            const rect = toggleBtn.getBoundingClientRect();
            offX = c.clientX - rect.left;
            offY = c.clientY - rect.top;
            isDragging = true;
            toggleBtn.style.cursor = 'grabbing';
            toggleBtn.style.transition = 'none';
        };
        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const c = e.touches ? e.touches[0] : e;
            let x = c.clientX - offX;
            let y = c.clientY - offY;
            x = Math.max(0, Math.min(window.innerWidth - 50, x));
            y = Math.max(0, Math.min(window.innerHeight - 50, y));
            container.style.right = 'auto';
            container.style.bottom = 'auto';
            container.style.left = x + 'px';
            container.style.top = y + 'px';
        };
        const onEnd = () => {
            if (isDragging) {
                isDragging = false;
                toggleBtn.style.cursor = 'grab';
                toggleBtn.style.transition = '0.2s';
            }
        };

        toggleBtn.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        toggleBtn.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);

        container.appendChild(panel);
        container.appendChild(toggleBtn);
        document.body.appendChild(container);

        console.log('[纯纯面板] ✅ 注入成功！右下角找猫爪 🐾');
    }

    // 启动
    if (document.readyState === 'complete') {
        setTimeout(injectUI, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(injectUI, 300);
        });
    }

})();