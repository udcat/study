(function() {
    'use strict';

    // ========== 头像映射配置区 ==========
    const avatarMap = {
        "糖糖喵": "😻",
        "手抄喵": "😾",
        "涩涩喵": "😽",
        "医师喵": "😺",
        "魔丸喵": "😼",
        "天使喵": "😸",
        "布丁汪": "🐶",
        "小猫之神": "👑"
    };
    const defaultAvatar = "😹";
    const enableOpen = true; // true默认展开，false默认收起
    // ====================================

    /**
     * 解析catparty内部文本，生成气泡HTML
     * @param {string} rawText
     * @returns {string}
     */
    function parseCatpartyContent(rawText) {
        const lines = rawText.split(/\r?\n/);
        let msgHtml = "";
        const lineRegex = /^(.+?)：\s*(?:[“"](.+?)[”"]|(.+?))$/;

        for (const line of lines) {
            const trimLine = line.trim();
            if (!trimLine) continue;
            const match = trimLine.match(lineRegex);
            if (!match) continue;

            const name = match[1].trim();
            const content = (match[2] ?? match[3]).trim();
            const avatar = avatarMap[name] ?? defaultAvatar;

            msgHtml += `
<div style="display:flex;gap:12px;margin:12px 0;align-items:flex-start;">
    <div style="width:48px;height:48px;border-radius:50%;background:#bcd9f5;flex-shrink:0;display:grid;place-items:center;font-size:26px;">${avatar}</div>
    <div>
        <div style="font-size:13px;color:#5088bd;margin-bottom:4px;">${name}</div>
        <div style="background:#ffffff;border-radius:0 16px 16px 16px;padding:10px 14px;font-size:14px;color:#334455;max-width:560px;line-height:1.6;">${content}</div>
    </div>
</div>`;
        }

        const openAttr = enableOpen ? " open" : "";
        const wrapHtml = `
<details class="blue-cp-box"${openAttr} style="margin:10px 0;border-radius:16px;background:linear-gradient(135deg,#f0f8ff,#e0f2fc);border:2px solid #b4d8f7;overflow:hidden;font-family:'Microsoft YaHei',sans-serif;">
<summary style="padding:10px 18px;font-weight:bold;font-size:15px;color:#2d6499;cursor:pointer;background:rgba(255,255,255,0.6);list-style:none;display:flex;align-items:center;gap:8px;user-select:none;">
<span style="font-size:18px;">🍵</span> 小猫工坊 · 茶话会
<span style="margin-left:auto;font-size:14px;color:#4e88b8;transition:transform 0.3s;">▼</span>
</summary>
<div style="padding:14px 18px;">
${msgHtml}
</div>
</details>
<style>
  .blue-cp-box summary::-webkit-details-marker { display: none; }
  .blue-cp-box[open] summary span:last-child { transform: rotate(180deg); display: inline-block; }
  .blue-cp-box summary:hover { background: rgba(255,255,255,0.9); }
  .blue-cp-box strong, .blue-cp-box b { color: #2778c2; }
</style>`;
        return wrapHtml;
    }

    /**
     * 处理全部消息文本，替换全部<catparty>块
     * @param {string} text
     * @returns {string}
     */
    function processMessage(text) {
        const reg = /<catparty>([\s\S]*?)<\/catparty>/g;
        return text.replace(reg, (_, innerContent) => parseCatpartyContent(innerContent));
    }

    // 挂载ST消息渲染钩子（酒馆助手标准onMessageRender）
    if (typeof extension !== "undefined") {
        const originRender = extension.onMessageRender;
        extension.onMessageRender = function (text) {
            let res = processMessage(text);
            if (typeof originRender === "function") {
                res = originRender(res);
            }
            return res;
        };
        console.log("[小猫工坊茶话会] ✅ 脚本加载完成");
    } else {
        console.warn("[小猫工坊茶话会] ⚠️ 未检测到酒馆助手环境");
    }
})();
