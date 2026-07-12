(function() {
    'use strict';

    const FOLD_ICON = '🌸';

    if (document.getElementById('chunchun-panel-container')) {
        console.log('[纯纯面板] 已存在，跳过注入');
        return;
    }

    console.log('[纯纯面板] 开始注入...');

    const STORAGE_KEY = 'chunchun_panel_data';
    const FOLD_STORAGE_KEY = 'chunchun_panel_fold';
    const defaultData = { time: '', clothes: '', mood: '', items: '' };

    let isFolded = localStorage.getItem(FOLD_STORAGE_KEY) !== 'false';

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

    function saveFoldState(folded) {
        try {
            localStorage.setItem(FOLD_STORAGE_KEY, folded ? 'true' : 'false');
        } catch (e) {}
    }

    function setInputText(text) {
        try {
            const parentWin = window.parent;
            if (parentWin && parentWin.SillyTavern && parentWin.SillyTavern.getContext) {
                const ctx = parentWin.SillyTavern.getContext();
                if (ctx && typeof ctx.setInputText === 'function') {
                    ctx.setInputText(text);
                    console.log('[纯纯面板] ✅ 已通过父窗口API插入');
                    return;
                }
            }
            if (parentWin) {
                const textarea = parentWin.document.querySelector('#send_textarea');
                if (textarea) {
                    textarea.value = text;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                    textarea.focus();
                    console.log('[纯纯面板] ✅ 已通过父窗口DOM插入');
                    return;
                }
            }
            if (window.SillyTavern && window.SillyTavern.getContext) {
                const ctx = window.SillyTavern.getContext();
                if (ctx && typeof ctx.setInputText === 'function') {
                    ctx.setInputText(text);
                    console.log('[纯纯面板] ✅ 已通过当前窗口API插入');
                    return;
                }
            }
            const textarea = document.querySelector('#send_textarea');
            if (textarea) {
                textarea.value = text;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();
                console.log('[纯纯面板] ✅ 已通过当前窗口DOM插入');
                return;
            }
            navigator.clipboard.writeText(text).then(() => {
                console.warn('[纯纯面板] ⚠️ 已复制到剪贴板');
                const toast = document.createElement('div');
                toast.textContent = '📋 已复制到剪贴板，请粘贴到输入框';
                toast.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 30px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    z-index: 9999999;
                    font-family: "Microsoft YaHei", sans-serif;
                    pointer-events: none;
                    transition: opacity 0.3s;
                `;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            }).catch(() => {
                prompt('请手动复制以下内容：', text);
            });
        } catch (e) {
            console.error('[纯纯面板] 插入失败:', e);
            prompt('请手动复制以下内容：', text);
        }
    }

    function getInputTextarea() {
        try {
            const parentWin = window.parent;
            if (parentWin) {
                const ta = parentWin.document.querySelector('#send_textarea');
                if (ta) return ta;
                if (parentWin.SillyTavern && parentWin.SillyTavern.getContext) {
                    const ctx = parentWin.SillyTavern.getContext();
                }
            }
            const ta = document.querySelector('#send_textarea');
            if (ta) return ta;
            return null;
        } catch (e) {
            return null;
        }
    }

    function buildStatusText(data) {
        return [
            '【{{user}}状态面板】',
            `时间地点：${data.time || ''}`,
            `我的服装：${data.clothes || ''}`,
            `情绪状态：${data.mood || ''}`,
            `随身携带：${data.items || ''}`
        ].join('\n') + '\n\n';
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
                    pointerEvents: 'auto',
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
                pointer-events: auto;
                display: block;
                visibility: visible;
                opacity: 1;
            `;
            document.body.appendChild(container);
        }

        const iconWrapper = document.createElement('div');
        iconWrapper.id = 'chunchun-icon-wrapper';
        iconWrapper.style.cssText = `
            pointer-events: auto;
            width: 54px;
            height: 54px;
            background: rgba(255, 245, 247, 0.96);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 2px solid rgba(255, 182, 193, 0.6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(211, 137, 156, 0.35);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
            user-select: none;
            position: relative;
            z-index: 1;
        `;
        iconWrapper.textContent = FOLD_ICON;
        iconWrapper.title = '点击展开状态面板';

        iconWrapper.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.15) rotate(10deg)';
            this.style.boxShadow = '0 8px 32px rgba(211, 137, 156, 0.5)';
        });
        iconWrapper.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
            this.style.boxShadow = '0 4px 20px rgba(211, 137, 156, 0.35)';
        });

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
            user-select: none;
            color: #4a343a;
            transition: box-shadow 0.2s;
            position: relative;
            display: none;
        `;

        const titleBar = document.createElement('div');
        titleBar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 18px;
            font-weight: 700;
            color: #b34b6a;
            margin-bottom: 16px;
            letter-spacing: 1px;
            border-bottom: 2px dashed rgba(255, 182, 193, 0.4);
            padding-bottom: 10px;
        `;

        const titleText = document.createElement('span');
        titleText.textContent = '🌸 我的状态面板';
        titleText.style.flex = '1';

        const foldBtn = document.createElement('button');
        foldBtn.textContent = '➖';
        foldBtn.style.cssText = `
            border: none;
            background: rgba(255, 182, 193, 0.3);
            border-radius: 50%;
            width: 28px;
            height: 28px;
            font-size: 16px;
            line-height: 1;
            cursor: pointer;
            color: #b34b6a;
            transition: background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        `;
        foldBtn.title = '折叠面板';
        foldBtn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(255, 182, 193, 0.6)';
        });
        foldBtn.addEventListener('mouseleave', function() {
            this.style.background = 'rgba(255, 182, 193, 0.3)';
        });

        titleBar.appendChild(foldBtn);
        titleBar.appendChild(titleText);

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

            const newText = buildStatusText(currentData);

            let textarea = null;
            try {
                const parentWin = window.parent;
                if (parentWin) {
                    textarea = parentWin.document.querySelector('#send_textarea');
                }
                if (!textarea) {
                    textarea = document.querySelector('#send_textarea');
                }
            } catch (e) {
                textarea = document.querySelector('#send_textarea');
            }

            if (textarea) {
                let existing = textarea.value || '';
                if (existing && !existing.endsWith('\n')) {
                    existing += '\n';
                }
                const combined = existing + newText;
                textarea.value = combined;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                textarea.focus();
                console.log('[纯纯面板] ✅ 已追加到输入框');
            } else {
                setInputText(newText);
                console.warn('[纯纯面板] ⚠️ 未找到输入框，使用覆盖模式');
            }

            this.textContent = '✅ 已追加！';
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

        panel.appendChild(titleBar);
        panel.appendChild(fieldContainer);
        panel.appendChild(updateBtn);

        function updateDisplay() {
            if (isFolded) {
                iconWrapper.style.display = 'flex';
                panel.style.display = 'none';
                container.style.width = '54px';
                container.style.height = '54px';
                container.style.borderRadius = '50%';
                container.style.background = 'transparent';
                container.style.backdropFilter = 'none';
                container.style.boxShadow = 'none';
                container.style.padding = '0';
            } else {
                iconWrapper.style.display = 'none';
                panel.style.display = 'block';
                container.style.width = 'auto';
                container.style.height = 'auto';
                container.style.borderRadius = '0';
                container.style.background = 'transparent';
                container.style.backdropFilter = 'none';
                container.style.boxShadow = 'none';
                container.style.padding = '0';
            }
        }

        iconWrapper.addEventListener('click', function() {
            isFolded = false;
            saveFoldState(false);
            updateDisplay();
            setTimeout(() => {
                const firstInput = panel.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        });

        foldBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isFolded = true;
            saveFoldState(true);
            updateDisplay();
        });

        container.appendChild(panel);
        container.appendChild(iconWrapper);
        updateDisplay();

        let isDragging = false;
        let startX, startY, originX, originY;

        function onDragStart(e) {
            const target = e.target;
            if (target.closest('input') || target.closest('button')) {
                return;
            }
            if (target.closest('#chunchun-fold-btn')) return;

            e.preventDefault();
            isDragging = true;
            const rect = container.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            originX = rect.left;
            originY = rect.top;
            container.style.cursor = 'grabbing';
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
        }

        function onDragMove(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            let newLeft = originX + dx;
            let newTop = originY + dy;
            const cw = container.offsetWidth || 54;
            const ch = container.offsetHeight || 54;
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            newLeft = Math.max(0, Math.min(winW - cw, newLeft));
            newTop = Math.max(0, Math.min(winH - ch, newTop));
            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';
        }

        function onDragEnd() {
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'default';
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragEnd);
            }
        }

        container.addEventListener('mousedown', onDragStart);

        window.addEventListener('resize', function() {
            const rect = container.getBoundingClientRect();
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            let left = rect.left;
            let top = rect.top;
            const cw = container.offsetWidth || 54;
            const ch = container.offsetHeight || 54;
            if (left + cw > winW) left = winW - cw;
            if (top + ch > winH) top = winH - ch;
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