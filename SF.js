// ==UserScript==
// @name         纯纯状态面板 · 潮汐风格
// @version      1.0
// @description  悬浮小球，点击展开状态面板，可拖拽
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==

$(() => {
    'use strict';

    // ---- 防止重复注入 ----
    if (document.getElementById('chunchun-root')) return;

    console.log('[纯纯面板] 开始加载...');

    // ---- 数据存储 ----
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

    // ---- 插入到酒馆输入框 ----
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

    // ---- 构建状态文本 ----
    function buildText(data) {
        return [
            '/setinput {{input}} ',
            '【纯纯状态面板】',
            `时间地点：${data.time || ''}`,
            `我的服装：${data.clothes || ''}`,
            `情绪状态：${data.mood || ''}`,
            `随身携带：${data.items || ''}`
        ].join('\n');
    }

    // ---- 创建悬浮小球 + 面板 ----
    const data = loadData();

    // ===== 1. 创建容器 =====
    const container = $('<div>')
        .attr('id', 'chunchun-root')
        .css({
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: '999999',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            fontFamily: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif'
        })
        .appendTo('body');

    // ===== 2. 创建面板（默认隐藏） =====
    const panel = $('<div>')
        .attr('id', 'chunchun-panel')
        .css({
            pointerEvents: 'auto',
            background: 'rgba(255, 245, 247, 0.98)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '2px solid rgba(255, 182, 193, 0.6)',
            borderRadius: '28px',
            padding: '24px 22px 22px',
            marginBottom: '14px',
            width: '340px',
            maxWidth: 'calc(100vw - 40px)',
            maxHeight: 'calc(100vh - 60px)',
            overflowY: 'auto',
            boxShadow: '0 16px 48px rgba(211, 137, 156, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'scale(0.8) translateY(10px)',
            opacity: '0',
            visibility: 'hidden',
            transformOrigin: 'bottom right',
            color: '#4a343a',
            fontSize: '14px',
            lineHeight: '1.8'
        })
        .appendTo(container);

    // ---- 面板内容 ----
    const title = $('<div>')
        .css({
            fontSize: '20px',
            fontWeight: '700',
            color: '#b34b6a',
            textAlign: 'center',
            marginBottom: '18px',
            letterSpacing: '1px',
            borderBottom: '2px dashed rgba(255, 182, 193, 0.4)',
            paddingBottom: '12px',
            cursor: 'default'
        })
        .text('🌸 我的状态面板')
        .appendTo(panel);

    const fields = [
        { key: 'time', label: '📅 时间地点', placeholder: '例如：2013年11月4日 22:26 澜京大学' },
        { key: 'clothes', label: '👗 我的服装', placeholder: '例如：奶茶店制服' },
        { key: 'mood', label: '😊 情绪状态', placeholder: '例如：放松' },
        { key: 'items', label: '🎒 随身携带', placeholder: '例如：500元现金，手机，学生证' }
    ];

    const inputs = {};
    const fieldContainer = $('<div>').appendTo(panel);

    fields.forEach(f => {
        const wrapper = $('<div>').css({ marginBottom: '12px' }).appendTo(fieldContainer);
        const label = $('<label>')
            .css({
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#b34b6a',
                marginBottom: '3px',
                letterSpacing: '0.3px',
                cursor: 'default'
            })
            .text(f.label)
            .appendTo(wrapper);

        const input = $('<input>')
            .attr('type', 'text')
            .attr('placeholder', f.placeholder)
            .val(data[f.key] || '')
            .css({
                width: '100%',
                padding: '8px 14px',
                border: '2px solid rgba(255, 182, 193, 0.4)',
                borderRadius: '30px',
                background: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                color: '#4a343a',
                outline: 'none',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                cursor: 'text',
                userSelect: 'text'
            })
            .appendTo(wrapper);

        input.on('focus', function() {
            $(this).css({
                borderColor: '#b34b6a',
                boxShadow: '0 0 0 4px rgba(179, 75, 106, 0.12)',
                background: 'rgba(255, 255, 255, 0.9)'
            });
        });
        input.on('blur', function() {
            $(this).css({
                borderColor: 'rgba(255, 182, 193, 0.4)',
                boxShadow: 'none',
                background: 'rgba(255, 255, 255, 0.7)'
            });
        });

        inputs[f.key] = input;
    });

    // ---- 更新按钮 ----
    const updateBtn = $('<button>')
        .text('✨ 更新')
        .css({
            width: '100%',
            padding: '10px 0',
            marginTop: '6px',
            background: 'linear-gradient(135deg, #ffb3c1, #ff8da1)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255, 105, 135, 0.3)',
            transition: 'all 0.25s ease',
            letterSpacing: '1px',
            fontFamily: 'inherit'
        })
        .appendTo(panel);

    updateBtn.on('mouseenter', function() {
        $(this).css({
            transform: 'scale(1.02)',
            boxShadow: '0 6px 24px rgba(255, 105, 135, 0.45)'
        });
    });
    updateBtn.on('mouseleave', function() {
        $(this).css({
            transform: 'scale(1)',
            boxShadow: '0 4px 16px rgba(255, 105, 135, 0.3)'
        });
    });

    updateBtn.on('click', function() {
        const currentData = {};
        fields.forEach(f => {
            currentData[f.key] = inputs[f.key].val().trim();
        });
        saveData(currentData);
        setInputText(buildText(currentData));
        $(this).text('✅ 已插入！');
        setTimeout(() => {
            $(this).text('✨ 更新');
        }, 1200);
    });

    // ---- 回车触发更新 ----
    fieldContainer.find('input').on('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateBtn.trigger('click');
        }
    });

    // ===== 3. 创建悬浮小球（FAB） =====
    const fab = $('<div>')
        .attr('id', 'chunchun-fab')
        .css({
            pointerEvents: 'auto',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ffb3c1, #ff8da1)',
            color: 'white',
            fontSize: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            boxShadow: '0 6px 20px rgba(255, 105, 135, 0.4)',
            userSelect: 'none',
            border: '3px solid rgba(255, 255, 255, 0.6)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            fontWeight: 'bold',
            zIndex: '10000'
        })
        .text('🐾')
        .appendTo(container);

    fab.on('mouseenter', function() {
        $(this).css({
            transform: 'scale(1.08)',
            boxShadow: '0 8px 28px rgba(255, 105, 135, 0.5)'
        });
    });
    fab.on('mouseleave', function() {
        $(this).css({
            transform: 'scale(1)',
            boxShadow: '0 6px 20px rgba(255, 105, 135, 0.4)'
        });
    });

    // ===== 4. 点击小球切换面板 =====
    let isOpen = false;

    fab.on('click', function(e) {
        if (isDragging) {
            isDragging = false;
            return;
        }
        isOpen = !isOpen;
        if (isOpen) {
            panel.css({
                transform: 'scale(1) translateY(0)',
                opacity: '1',
                visibility: 'visible'
            });
            fab.css({
                transform: 'scale(0.95)',
                boxShadow: '0 4px 12px rgba(255, 105, 135, 0.3)'
            });
        } else {
            panel.css({
                transform: 'scale(0.8) translateY(10px)',
                opacity: '0',
                visibility: 'hidden'
            });
            fab.css({
                transform: 'scale(1)',
                boxShadow: '0 6px 20px rgba(255, 105, 135, 0.4)'
            });
        }
    });

    // ===== 5. 拖拽功能（和潮汐一样） =====
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    fab.on('mousedown', function(e) {
        if (e.button !== 0) return;
        const rect = fab[0].getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        isDragging = false;
        fab.css('cursor', 'grabbing');
        $(document).on('mousemove', onDragMove);
        $(document).on('mouseup', onDragEnd);
        e.preventDefault();
    });

    function onDragMove(e) {
        isDragging = true;
        let left = e.clientX - dragOffsetX;
        let top = e.clientY - dragOffsetY;
        const fabSize = 50;
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        left = Math.max(0, Math.min(winW - fabSize, left));
        top = Math.max(0, Math.min(winH - fabSize, top));
        container.css({
            left: left + 'px',
            top: top + 'px',
            right: 'auto',
            bottom: 'auto'
        });
    }

    function onDragEnd() {
        $(document).off('mousemove', onDragMove);
        $(document).off('mouseup', onDragEnd);
        fab.css('cursor', 'grab');
        setTimeout(() => { isDragging = false; }, 50);
    }

    // ---- 窗口大小变化时保持小球在屏幕内 ----
    $(window).on('resize', function() {
        const rect = container[0].getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const pw = container.width();
        const ph = container.height();
        let left = rect.left;
        let top = rect.top;
        if (left + pw > winW) left = winW - pw;
        if (top + ph > winH) top = winH - ph;
        if (left < 0) left = 0;
        if (top < 0) top = 0;
        container.css({ left: left + 'px', top: top + 'px', right: 'auto', bottom: 'auto' });
    });

    console.log('[纯纯面板] ✅ 注入成功！右下角找猫爪 🐾');
});