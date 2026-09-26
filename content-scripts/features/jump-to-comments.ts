import { KeyJumpToComments } from '../../storage-keys'
import addStyles, { removeStyles } from '../utilities/addStyles'
import { getStorage } from '../utilities/storage'

const JUMP_STYLES = `
:root {
  --xf-jump-bg: rgba(255, 255, 255, 0.88);
  --xf-jump-bg-hover: rgba(239, 243, 244, 0.95);
  --xf-jump-border: rgb(159, 181, 195);
  --xf-jump-color: rgb(15, 20, 25);
  --xf-jump-shadow: rgba(101, 119, 134, 0.2) 0px 0px 15px 0px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --xf-jump-bg: rgba(0, 0, 0, 0.88);
    --xf-jump-bg-hover: rgba(30, 39, 50, 0.95);
    --xf-jump-border: rgb(56, 68, 77);
    --xf-jump-color: rgb(231, 233, 234);
    --xf-jump-shadow: rgba(255, 255, 255, 0.12) 0px 0px 12px 0px, rgba(255, 255, 255, 0.08) 0px 0px 2px 1px;
  }
}

html[style*="background-color: rgb(0, 0, 0)"],
html[style*="background-color: rgb(21, 32, 43)"],
body[style*="background-color: rgb(0, 0, 0)"],
body[style*="background-color: rgb(21, 32, 43)"] {
  --xf-jump-bg: rgba(0, 0, 0, 0.88);
  --xf-jump-bg-hover: rgba(30, 39, 50, 0.95);
  --xf-jump-border: rgb(56, 68, 77);
  --xf-jump-color: rgb(231, 233, 234);
  --xf-jump-shadow: rgba(255, 255, 255, 0.12) 0px 0px 12px 0px, rgba(255, 255, 255, 0.08) 0px 0px 2px 1px;
}

#xf-jump-to-comments {
  position: fixed !important;
  right: 20px !important;
  bottom: var(--xf-jump-bottom, 146px) !important;
  height: 55px !important;
  width: 55px !important;
  border-radius: 16px !important;
  background-color: var(--xf-jump-bg) !important;
  color: var(--xf-jump-color) !important;
  border: 1px solid var(--xf-jump-border) !important;
  cursor: pointer !important;
  box-shadow: var(--xf-jump-shadow) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  z-index: 9999 !important;
  padding: 0 !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transform: translateY(8px) scale(0.95) !important;
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), width 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, bottom 0.2s ease !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif !important;
  user-select: none !important;
  -webkit-tap-highlight-color: transparent !important;
  box-sizing: border-box !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
}

#xf-jump-to-comments.xf-visible {
  opacity: 1 !important;
  pointer-events: auto !important;
  transform: translateY(0) scale(1) !important;
}

#xf-jump-to-comments:hover {
  width: 132px !important;
  background-color: var(--xf-jump-bg-hover) !important;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, background-color 0.15s ease 0.3s, bottom 0.2s ease, opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

#xf-jump-to-comments:active {
  transform: scale(0.96) !important;
}

#xf-jump-to-comments .xf-jump-icon {
  width: 53px !important;
  height: 53px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

#xf-jump-to-comments .xf-jump-text {
  font-size: 13.5px !important;
  font-weight: 600 !important;
  color: var(--xf-jump-color) !important;
  padding-right: 14px !important;
  opacity: 0 !important;
  transform: translateX(6px) !important;
  transition: opacity 0.15s ease, transform 0.15s ease !important;
}

#xf-jump-to-comments:hover .xf-jump-text {
  opacity: 1 !important;
  transform: translateX(0) !important;
  transition: opacity 0.15s ease 0.3s, transform 0.15s ease 0.3s !important;
}

@keyframes xf-reply-border-pulse {
  0% {
    box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0), inset 0 0 0 rgba(29, 155, 240, 0);
  }
  20% {
    box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0.85), inset 0 0 6px rgba(29, 155, 240, 0.22);
  }
  45% {
    box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0.3), inset 0 0 2px rgba(29, 155, 240, 0.06);
  }
  70% {
    box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0.85), inset 0 0 6px rgba(29, 155, 240, 0.22);
  }
  100% {
    box-shadow: inset 0 0 0 1px rgba(29, 155, 240, 0), inset 0 0 0 rgba(29, 155, 240, 0);
  }
}

.xf-jump-highlighted,
.xf-jump-highlighted > div:first-child {
  border-radius: 12px !important;
  animation: xf-reply-border-pulse 2s ease-in-out forwards !important;
}
`

export type JumpDirection = 'down' | 'up'

export function isTweetDetailPage(pathname: string = window.location.pathname): boolean {
  return /\/status\/\d+/.test(pathname) || pathname.startsWith('/i/article/')
}

/**
 * 探测右下角原有的浮动组件（Grok 按钮/窗口、私信 Chat 按钮/窗口），
 * 无论处于折叠还是展开状态（例如点击 Chat 展开会将 Grok 向上顶起并重排），
 * 计算出垂直堆叠在所有右下角浮动元素最上方的 bottom 像素偏移，彻底避免互相遮挡。
 */
export function getBottomOffset(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 24

  const candidates = [
    document.querySelector<HTMLElement>('[data-testid="GrokDrawer"]'),
    document.querySelector<HTMLElement>('[data-testid="GrokDrawerHeader"]'),
    document.querySelector<HTMLElement>('[data-testid="chat-drawer-root"]'),
    document.querySelector<HTMLElement>('[data-testid="chat-drawer-main"]'),
  ].filter(Boolean) as HTMLElement[]

  const windowW = window.innerWidth
  const windowH = window.innerHeight
  let highestTop = windowH

  for (const el of candidates) {
    const r = el.getBoundingClientRect()
    // 元素必须在视口内实际可见且占用右下角区域
    if (r.height > 0 && r.width > 0 && r.right > windowW - 250 && r.top < windowH && r.bottom > 0) {
      if (r.top < highestTop) {
        highestTop = r.top
      }
    }
  }

  if (highestTop < windowH) {
    const neededBottom = windowH - highestTop + 12
    // 预留顶部安全边距，确保按钮绝不越出视口顶部（至少留 75px）
    const maxBottom = windowH - 75
    return Math.max(24, Math.min(neededBottom, maxBottom))
  }

  return 24
}

let cachedComposerY: number | null = null

/**
 * 聚焦回复框的核心方法：精确定位 contenteditable 或输入框元素，并触发 click 唤起完整编辑状态
 */
export function focusReplyComposer(root?: HTMLElement | null): boolean {
  if (typeof document === 'undefined') return false

  const scope = root || document
  // 核心：精准匹配真实可输入的文本框，必须排除外层的纯展示容器 (如 tweetTextarea_0_label)
  const editable =
    scope.querySelector<HTMLElement>('[data-testid="tweetTextarea_0"]') ||
    scope.querySelector<HTMLElement>('[data-testid^="tweetTextarea"][contenteditable="true"]') ||
    scope.querySelector<HTMLElement>('[role="textbox"][contenteditable="true"]') ||
    scope.querySelector<HTMLElement>('.DraftEditor-editorContainer [contenteditable="true"]') ||
    (root ? document.querySelector<HTMLElement>('[data-testid="tweetTextarea_0"]') : null) ||
    scope.querySelector<HTMLElement>('textarea, input')

  if (!editable) return false

  try {
    editable.focus()
    // Twitter/X 基于 Draft.js / Lexical，调用 click() 能够初始化选区并将光标置入文本框
    editable.click()
    return document.activeElement === editable
  } catch {
    return false
  }
}

/**
 * 查找发评论的目标输入区域。
 * 核心原则：无论看主帖还是看评论，首要直达用户自己可以发评论的输入区域（Reply Composer）。
 */
export function findCommentsTarget(): HTMLElement | null {
  if (typeof document === 'undefined') return null

  // 1. 最高优先级：直接定位内联回复输入框区域（Reply Composer）
  //    匹配特征：tweetTextarea_0 文本框、tweetTextarea_0_label 标签或 tweetButtonInline 回复按钮
  const textarea = document.querySelector<HTMLElement>(
    '[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea_0_label"], [data-testid="tweetButtonInline"]',
  )
  if (textarea) {
    // 向上寻找整块外层回复卡片容器，保证平滑滚动时用户头像、输入框与工具栏整体呈现在视口上方
    // 注意：若 cellInnerDiv 同时包含了主推文 article，则不可使用 cellInnerDiv 作为定位目标，否则会导致高度与顶部位置判定失真
    const cell = textarea.closest<HTMLElement>('[data-testid="cellInnerDiv"]')
    const isStandaloneCell = cell && !cell.querySelector('article[data-testid="tweet"]')
    const composerCard =
      textarea.closest<HTMLElement>('[data-testid="inline_reply_offscreen"]') ||
      textarea.closest<HTMLElement>('.r-3pj75a') ||
      (isStandaloneCell ? cell : null) ||
      textarea.closest<HTMLElement>('div[class*="r-184en5c"]') ||
      textarea

    if (typeof window !== 'undefined') {
      const top = composerCard.getBoundingClientRect().top + window.scrollY
      if (top > 0) {
        cachedComposerY = top
      }
    }
    return composerCard
  }

  // 2. 长文章阅读视图（twitterArticleReadView）
  const articleReadView = document.querySelector<HTMLElement>('[data-testid="twitterArticleReadView"]')
  if (articleReadView) {
    const parentCell = articleReadView.closest('[data-testid="cellInnerDiv"]')
    if (parentCell?.nextElementSibling instanceof HTMLElement) {
      return parentCell.nextElementSibling
    }
    return articleReadView
  }

  // 3. 兜底方案：定位原生的回复输入框外层容器
  const inlineReply = document.querySelector<HTMLElement>('[data-testid="inline_reply_offscreen"]')
  if (inlineReply) {
    if (typeof window !== 'undefined') {
      const top = inlineReply.getBoundingClientRect().top + window.scrollY
      if (top > 0) {
        cachedComposerY = top
      }
    }
    return inlineReply
  }

  // 4. 次级兜底：当作者限制回复或已关闭评论、尚未加载输入框时，定位到主帖下方的第一个单元格/第一条评论
  const articles = Array.from(document.querySelectorAll<HTMLElement>('article[data-testid="tweet"]'))
  if (articles.length > 0) {
    const statusMatch = window.location.pathname.match(/\/status\/(\d+)/)
    const statusId = statusMatch?.[1]
    let mainTweetIndex = -1
    if (statusId) {
      mainTweetIndex = articles.findIndex((art) => art.querySelector(`a[href*="/status/${statusId}"]`))
    }
    if (mainTweetIndex === -1) mainTweetIndex = 0

    // 如果主帖之后已有评论推文，定位到第一条评论
    if (articles.length > mainTweetIndex + 1) {
      return articles[mainTweetIndex + 1]
    }

    // 否则定位主帖所在的 cellInnerDiv 的下一个兄弟节点或主帖本身
    const mainCell = articles[mainTweetIndex]?.closest('[data-testid="cellInnerDiv"]')
    if (mainCell?.nextElementSibling instanceof HTMLElement) {
      return mainCell.nextElementSibling
    }

    return articles[mainTweetIndex] || null
  }

  return null
}

const ICON_DOWN = `
<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3c-4.97 0-9 3.8-9 8.5 0 1.6.47 3.1 1.3 4.4L3.1 19.8c-.2.6.3 1.2.9 1l4.2-1.3c1.1.6 2.4.9 3.8.9 4.97 0 9-3.8 9-8.5S16.97 3 12 3zm0 2c3.87 0 7 2.91 7 6.5s-3.13 6.5-7 6.5c-1.18 0-2.3-.27-3.3-.77l-.4-.2-2.5.8.7-2.3-.3-.4C5.43 14.28 5 12.94 5 11.5 5 7.91 8.13 5 12 5z"/>
  <path d="M11.3 7.5h1.4v4.5l1.3-1.3 1 1-3 3.8-3-3.8 1-1 1.3 1.3V7.5z"/>
</svg>
`

const ICON_UP = `
<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3c-4.97 0-9 3.8-9 8.5 0 1.6.47 3.1 1.3 4.4L3.1 19.8c-.2.6.3 1.2.9 1l4.2-1.3c1.1.6 2.4.9 3.8.9 4.97 0 9-3.8 9-8.5S16.97 3 12 3zm0 2c3.87 0 7 2.91 7 6.5s-3.13 6.5-7 6.5c-1.18 0-2.3-.27-3.3-.77l-.4-.2-2.5.8.7-2.3-.3-.4C5.43 14.28 5 12.94 5 11.5 5 7.91 8.13 5 12 5z"/>
  <path d="M12.7 15.5h-1.4v-4.5l-1.3 1.3-1-1 3-3.8 3 3.8-1 1-1.3-1.3v4.5z"/>
</svg>
`

let scrollListenerActive = false
let rafPending = false

function createJumpButton(): HTMLElement {
  let btn = document.getElementById('xf-jump-to-comments')
  if (btn) return btn

  btn = document.createElement('button')
  btn.id = 'xf-jump-to-comments'
  btn.setAttribute('aria-label', '向下直达回复框')
  btn.setAttribute('title', '向下直达回复框')
  btn.innerHTML = `
    <div class="xf-jump-icon">${ICON_DOWN}</div>
    <span class="xf-jump-text">直达回复</span>
  `

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()

    const status = getJumpTargetStatus()
    const target = status?.target || findCommentsTarget()
    const headerOffset = 60

    let targetY: number
    if (target && document.body.contains(target)) {
      targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset
    } else if (cachedComposerY !== null) {
      targetY = cachedComposerY - headerOffset
    } else {
      // 兜底：主推文与输入框位于时间线最顶部
      targetY = 0
    }

    targetY = Math.max(0, targetY)

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    })

    const triggerFocusAndHighlight = () => {
      try {
        const currentTarget =
          findCommentsTarget() ||
          document.querySelector<HTMLElement>('[data-testid="inline_reply_offscreen"]') ||
          target

        // 自动聚焦回复输入框
        focusReplyComposer(currentTarget)

        // 视觉微呼吸边框高亮
        if (currentTarget) {
          currentTarget.classList.remove('xf-jump-highlighted')
          if (currentTarget.firstElementChild) {
            currentTarget.firstElementChild.classList.remove('xf-jump-highlighted')
          }
          void currentTarget.offsetWidth
          currentTarget.classList.add('xf-jump-highlighted')
          if (currentTarget.firstElementChild) {
            currentTarget.firstElementChild.classList.add('xf-jump-highlighted')
          }

          setTimeout(() => {
            currentTarget.classList.remove('xf-jump-highlighted')
            if (currentTarget.firstElementChild) {
              currentTarget.firstElementChild.classList.remove('xf-jump-highlighted')
            }
          }, 2200)
        }
      } catch {}
    }

    // 智能动态等待平滑滚动到位（支持现代 scrollend + 滚动位移停滞轮询检测 + 兜底）
    let settled = false
    const onScrollFinished = () => {
      if (settled) return
      settled = true
      window.removeEventListener('scrollend', onScrollFinished)
      clearInterval(settleInterval)
      clearTimeout(maxFallbackTimer)
      triggerFocusAndHighlight()
      // Twitter 虚拟滚动异步重绘兜底：120ms 后再次触发聚焦以确保光标稳定置入
      setTimeout(() => {
        focusReplyComposer(findCommentsTarget())
      }, 120)
    }

    window.addEventListener('scrollend', onScrollFinished, { once: true })

    let lastY = window.scrollY
    const settleInterval = setInterval(() => {
      const currY = window.scrollY
      const reachedTarget = Math.abs(currY - targetY) < 20
      const isStopped = Math.abs(currY - lastY) < 2 && Math.abs(currY - targetY) < 150
      const hasEditable = !!document.querySelector('[data-testid="tweetTextarea_0"]')
      if ((reachedTarget || isStopped) && hasEditable) {
        onScrollFinished()
      }
      lastY = currY
    }, 60)

    const maxFallbackTimer = setTimeout(onScrollFinished, 1200)
  })

  document.body.appendChild(btn)
  return btn
}

/**
 * 计算发评论目标的视口状态与直达方向
 */
export function getJumpTargetStatus(): {
  target: HTMLElement
  direction: JumpDirection
  shouldShow: boolean
} | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null
  if (!isTweetDetailPage()) return null

  const target = findCommentsTarget()
  if (!target) return null

  const rect = target.getBoundingClientRect()
  const windowHeight = window.innerHeight
  const headerOffset = 60

  // 发评论区域是否完整/充分地在当前可视区域中（此时用户正在该区域面前，无需显示按钮）
  const isInsideViewport = rect.top <= windowHeight - 80 && rect.bottom >= headerOffset + 20

  if (isInsideViewport) {
    return { target, direction: 'down', shouldShow: false }
  }

  // 目标在视口下方（人在看主贴上方）-> 向下直达 (down)
  // 目标在视口上方（人在翻看下方评论）-> 向上直达 (up)
  const isBelow = rect.top > windowHeight - 80
  const direction: JumpDirection = isBelow ? 'down' : 'up'

  const isScrollable = document.documentElement.scrollHeight > windowHeight + 40

  return {
    target,
    direction,
    shouldShow: isScrollable,
  }
}

/**
 * 核心可见性检查与双向方向动态更新
 */
export function checkJumpButtonVisibility(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const btn = document.getElementById('xf-jump-to-comments')
  const status = getJumpTargetStatus()

  if (!status || !status.shouldShow) {
    if (btn) btn.classList.remove('xf-visible')
    return
  }

  const el = btn || createJumpButton()
  const bottomOffset = getBottomOffset()
  el.style.setProperty('--xf-jump-bottom', `${bottomOffset}px`)

  // 动态更新方向图标、文案与状态
  const iconContainer = el.querySelector<HTMLElement>('.xf-jump-icon')
  const textContainer = el.querySelector<HTMLElement>('.xf-jump-text')

  if (status.direction === 'up') {
    el.setAttribute('aria-label', '向上直达回复框')
    el.setAttribute('title', '向上直达回复框')
    el.classList.add('xf-direction-up')
    el.classList.remove('xf-direction-down')
    if (iconContainer && !el.dataset.xfDirUp) {
      iconContainer.innerHTML = ICON_UP
      el.dataset.xfDirUp = '1'
      delete el.dataset.xfDirDown
    }
    if (textContainer && textContainer.textContent !== '直达回复') {
      textContainer.textContent = '直达回复'
    }
  } else {
    el.setAttribute('aria-label', '向下直达回复框')
    el.setAttribute('title', '向下直达回复框')
    el.classList.add('xf-direction-down')
    el.classList.remove('xf-direction-up')
    if (iconContainer && !el.dataset.xfDirDown) {
      iconContainer.innerHTML = ICON_DOWN
      el.dataset.xfDirDown = '1'
      delete el.dataset.xfDirUp
    }
    if (textContainer && textContainer.textContent !== '直达回复') {
      textContainer.textContent = '直达回复'
    }
  }

  el.classList.add('xf-visible')
}

function handleScrollOrResize() {
  if (rafPending) return
  rafPending = true
  requestAnimationFrame(() => {
    rafPending = false
    checkJumpButtonVisibility()
  })
}

let drawerObserver: MutationObserver | null = null

function handleDrawerMutation() {
  handleScrollOrResize()
  // Twitter 展开/收起过渡动画约为 200ms ease-out，在动画中段及完成时刻各复查一次以保证绝对平滑对齐
  setTimeout(handleScrollOrResize, 100)
  setTimeout(handleScrollOrResize, 220)
}

function ensureDrawerObserver() {
  if (drawerObserver || typeof document === 'undefined') return
  const target = document.getElementById('layers') || document.body
  if (!target) return
  drawerObserver = new MutationObserver(handleDrawerMutation)
  drawerObserver.observe(target, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ['style', 'class'],
  })
}

function removeDrawerObserver() {
  if (drawerObserver) {
    drawerObserver.disconnect()
    drawerObserver = null
  }
}

function ensureListeners() {
  if (scrollListenerActive || typeof window === 'undefined') return
  window.addEventListener('scroll', handleScrollOrResize, { passive: true })
  window.addEventListener('resize', handleScrollOrResize, { passive: true })
  ensureDrawerObserver()
  scrollListenerActive = true
}

function removeListeners() {
  removeDrawerObserver()
  if (!scrollListenerActive || typeof window === 'undefined') return
  window.removeEventListener('scroll', handleScrollOrResize)
  window.removeEventListener('resize', handleScrollOrResize)
  scrollListenerActive = false
}

/**
 * 响应动态更新与页面加载
 */
export async function updateJumpToComments(force = false): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (!isTweetDetailPage()) {
    destroyJumpToComments()
    return
  }

  if (!force) {
    const state = await getStorage(KeyJumpToComments)
    if (state === 'off') {
      destroyJumpToComments()
      return
    }
  }

  addStyles('jumpToCommentsStyles', JUMP_STYLES)
  createJumpButton()
  ensureListeners()
  checkJumpButtonVisibility()
}

/**
 * 销毁直达评论区浮钮及对应监听
 */
export function destroyJumpToComments(): void {
  removeListeners()
  cachedComposerY = null
  const btn = document.getElementById('xf-jump-to-comments')
  if (btn) btn.remove()
  removeStyles('jumpToCommentsStyles')
}
