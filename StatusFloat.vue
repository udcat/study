<template>
  <!-- 悬浮拖拽圆球 -->
  <Transition name="float-fab">
    <button
      v-if="!panelOpen"
      ref="fabRef"
      class="status-fab"
      :class="{ dragging: isDragging }"
      :style="fabStyle"
      @pointerdown="onFabPointerDown"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8v4l3 3"></path>
      </svg>
    </button>
  </Transition>
  <!-- 状态面板弹窗 -->
  <Transition name="float-panel">
    <div v-if="panelOpen" class="panel-overlay" @click.self="closePanel">
      <div class="status-panel">
        <!-- 头部标题栏 -->
        <div class="panel-header">
          <span class="panel-title">【我的状态面板】</span>
          <button class="close-btn" @click="panelOpen = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2">
              <line x1="6" y1="6" x2="18" y2="18"></line>
              <line x1="18" y1="6" x2="6" y2="18"></line>
            </svg>
          </button>
        </div>
        <!-- 表单内容区域 -->
        <div class="panel-body">
          <div class="form-item">
            <label class="form-label">时间地点</label>
            <input v-model="formData.timePlace" class="form-input" placeholder="例：2013年11月4日 星期一 22:26 澜京大学" spellcheck="false" />
          </div>
          <div class="form-item">
            <label class="form-label">我的服装</label>
            <input v-model="formData.clothes" class="form-input" placeholder="例：奶茶店制服" spellcheck="false" />
          </div>
          <div class="form-item">
            <label class="form-label">情绪状态</label>
            <input v-model="formData.mood" class="form-input" placeholder="例：放松" spellcheck="false" />
          </div>
          <div class="form-item">
            <label class="form-label">随身携带</label>
            <textarea v-model="formData.belong" class="form-textarea" placeholder="例：500元现金，手机，学生证，深空小区门禁卡" spellcheck="false"></textarea>
          </div>
        </div>
        <!-- 底部更新按钮 -->
        <div class="panel-footer">
          <button class="update-btn" @click="handleUpdate">【更新】</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

// ====================== 悬浮球拖拽逻辑（复刻潮汐原理）======================
const FAB_SIZE = 48
const EDGE_GAP = 12
const DRAG_THRESHOLD = 6
const STORAGE_KEY = 'status_fab_pos'
const FORM_STORAGE_KEY = 'status_form_data'
const fabRef = ref<HTMLButtonElement | null>(null)
const panelOpen = ref(false)
const isDragging = ref(false)

// 拖拽坐标存储
const fabPos = reactive({ x: 0, y: 0 })
// 拖拽临时变量
let dragStart = { x: 0, y: 0 }
let dragBase = { x: 0, y: 0 }
let hasMoved = false

// 读取悬浮球位置
function readFabPos() {
  try {
    const str = localStorage.getItem(STORAGE_KEY)
    if (str) return JSON.parse(str)
  } catch (e) {}
  // 默认右下角位置
  return {
    x: window.innerWidth - FAB_SIZE - 20,
    y: window.innerHeight * 0.3
  }
}

// 保存悬浮球位置
function saveFabPos(pos: { x: number, y: number }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pos))
}

// 边界限制函数（修复原代码clamp不存在bug）
function clampPos(x: number, y: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    x: Math.max(EDGE_GAP, Math.min(vw - FAB_SIZE - EDGE_GAP, x)),
    y: Math.max(EDGE_GAP, Math.min(vh - FAB_SIZE - EDGE_GAP, y))
  }
}

// 实时样式计算
const fabStyle = computed(() => ({
  left: `${fabPos.x}px`,
  top: `${fabPos.y}px`
}))

// 按下拖拽
function onFabPointerDown(e: PointerEvent) {
  e.preventDefault()
  isDragging.value = false
  hasMoved = false
  dragStart = { x: e.clientX, y: e.clientY }
  dragBase = { ...fabPos }
  window.addEventListener('pointermove', onFabMove)
  window.addEventListener('pointerup', onFabUp)
}

// 拖动中
function onFabMove(e: PointerEvent) {
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  if (Math.abs(dx) <= DRAG_THRESHOLD && Math.abs(dy) <= DRAG_THRESHOLD) return
  hasMoved = true
  isDragging.value = true
  // 修复：clamp -> clampPos
  const newPos = clampPos(dragBase.x + dx, dragBase.y + dy)
  fabPos.x = newPos.x
  fabPos.y = newPos.y
}

// 松开
function onFabUp() {
  window.removeEventListener('pointermove', onFabMove)
  window.removeEventListener('pointerup', onFabUp)
  isDragging.value = false
  if (!hasMoved) {
    panelOpen.value = true
  } else {
    saveFabPos(fabPos)
  }
}

// 窗口缩放重新约束位置
function resizeHandler() {
  const fixed = clampPos(fabPos.x, fabPos.y)
  fabPos.x = fixed.x
  fabPos.y = fixed.y
}

// 关闭弹窗
function closePanel() {
  panelOpen.value = false
}

// ====================== 表单数据（增加本地持久化） ======================
// 默认初始数据
const defaultForm = {
  timePlace: '2013年11月4日 星期一 22:26 澜京大学',
  clothes: '奶茶店制服',
  mood: '放松',
  belong: '500元现金，手机，学生证，深空小区门禁卡'
}

// 读取本地保存的表单
function loadFormData() {
  try {
    const cache = localStorage.getItem(FORM_STORAGE_KEY)
    if (cache) return JSON.parse(cache)
  } catch (e) {}
  return { ...defaultForm }
}

const formData = reactive(loadFormData())

// 监听表单变化，自动存入本地
watch(formData, (val) => {
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

// 更新按钮点击事件（宏逻辑预留）
function handleUpdate() {
  alert('状态已更新！\n' + JSON.stringify(formData, null, 2))
  // 后续宏功能写在这里
}

// ====================== 生命周期 ======================
onMounted(() => {
  const initPos = readFabPos()
  // 修复：fabPos.y = initPos 赋值错误
  fabPos.x = initPos.x
  fabPos.y = initPos.y
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
})
</script>

<style scoped>
/* 全局变量，和潮汐统一配色 */
:root {
  --bg-dark: #060b14;
  --primary: #7dd3fc;
  --primary-dim: rgba(125, 211, 252, 0.15);
  --text-main: rgba(255, 255, 255, 0.88);
  --text-dim: rgba(255, 255, 255, 0.4);
  --border: rgba(125, 211, 252, 0.15);
}

/* 悬浮圆球 */
.status-fab {
  position: fixed;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-dark);
  backdrop-filter: blur(8px);
  cursor: grab;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px var(--primary-dim), 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.15s, box-shadow 0.2s;
  padding: 0;
}
.status-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 0 24px rgba(125, 211, 252, 0.25);
}
.status-fab.dragging {
  cursor: grabbing;
  transform: scale(1);
}

/* 圆球淡入淡出动画 */
.float-fab-enter-active, .float-fab-leave-active {
  transition: opacity 0.2s ease;
}
.float-fab-enter-from, .float-fab-leave-to {
  opacity: 0;
}

/* 遮罩层 */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
}

/* 状态面板主体 */
.status-panel {
  width: 92%;
  max-width: 460px;
  max-height: 85vh;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(0,0,0,0.55);
}

/* 面板弹出动画 */
.float-panel-enter-active, .float-panel-leave-active {
  transition: opacity 0.25s ease;
}
.float-panel-enter-from, .float-panel-leave-to {
  opacity: 0;
}

/* 头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: 0.4px;
}
.close-btn {
  width: 30px;
  height: 30px; /* 修复：补充px单位 */
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover {
  background: var(--primary-dim);
}

/* 表单主体 */
.panel-body {
  padding: 14px 16px;
  flex: 1;
  overflow-y: auto;
}
.form-item {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 12px;
  color: var(--text-dim);
}
.form-input, .form-textarea {
  width: 100%;
  background: rgba(8, 14, 24, 0.75);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 11px;
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border 0.15s;
}
.form-input:focus, .form-textarea:focus {
  border-color: var(--primary);
}
/* 修复rgba颜色缺失通道 */
.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255,255,255,0.28);
}
.form-textarea {
  min-height: 70px;
  resize: vertical;
}

/* 底部按钮 */
.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.update-btn {
  padding: 7px 24px;
  border-radius: 8px;
  border: 1px solid rgba(125, 211, 0.3);
  background: var(--primary-dim);
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.update-btn:hover {
  background: rgba(125, 211, 0.22);
  border-color: rgba(125, 211, 0.45);
}
</style>