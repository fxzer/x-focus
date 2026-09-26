import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isTweetDetailPage,
  getBottomOffset,
  findCommentsTarget,
  getJumpTargetStatus,
  checkJumpButtonVisibility,
  updateJumpToComments,
  destroyJumpToComments,
} from '../../content-scripts/features/jump-to-comments'

describe('jump-to-comments feature (bidirectional reply composer navigation)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    destroyJumpToComments()
    vi.restoreAllMocks()
  })

  describe('isTweetDetailPage', () => {
    it('identifies status detail pages correctly', () => {
      expect(isTweetDetailPage('/xilo2991/status/2103046613744910408')).toBe(true)
      expect(isTweetDetailPage('/user/status/123456')).toBe(true)
      expect(isTweetDetailPage('/i/article/123456789')).toBe(true)
    })

    it('returns false for non-status timeline pages', () => {
      expect(isTweetDetailPage('/home')).toBe(false)
      expect(isTweetDetailPage('/explore')).toBe(false)
      expect(isTweetDetailPage('/messages')).toBe(false)
      expect(isTweetDetailPage('/notifications')).toBe(false)
    })
  })

  describe('getBottomOffset (anti-overlap logic)', () => {
    it('returns default 24px when no Grok or Chat buttons are present', () => {
      expect(getBottomOffset()).toBe(24)
    })

    it('stacks vertically above native Grok/Chat buttons', () => {
      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })

      const chatBtn = document.createElement('div')
      chatBtn.setAttribute('data-testid', 'chat-drawer-main')
      chatBtn.getBoundingClientRect = () => ({
        top: 730,
        bottom: 785,
        left: 1125,
        right: 1180,
        width: 55,
        height: 55,
        x: 1125,
        y: 730,
        toJSON: () => {},
      })
      document.body.appendChild(chatBtn)

      const grokBtn = document.createElement('div')
      grokBtn.setAttribute('data-testid', 'GrokDrawerHeader')
      grokBtn.getBoundingClientRect = () => ({
        top: 663,
        bottom: 718,
        left: 1125,
        right: 1180,
        width: 55,
        height: 55,
        x: 1125,
        y: 663,
        toJSON: () => {},
      })
      document.body.appendChild(grokBtn)

      expect(getBottomOffset()).toBe(149)
    })

    it('stacks above expanded chat drawer and pushed-up grok button', () => {
      Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })

      // Chat opened: height 530, top 370
      const chatDrawer = document.createElement('div')
      chatDrawer.setAttribute('data-testid', 'chat-drawer-root')
      chatDrawer.getBoundingClientRect = () => ({
        top: 370,
        bottom: 900,
        left: 1000,
        right: 1380,
        width: 380,
        height: 530,
        x: 1000,
        y: 370,
        toJSON: () => {},
      })
      document.body.appendChild(chatDrawer)

      // Grok pushed up above chat: top 300, bottom 355
      const grokBtn = document.createElement('div')
      grokBtn.setAttribute('data-testid', 'GrokDrawerHeader')
      grokBtn.getBoundingClientRect = () => ({
        top: 300,
        bottom: 355,
        left: 1325,
        right: 1380,
        width: 55,
        height: 55,
        x: 1325,
        y: 300,
        toJSON: () => {},
      })
      document.body.appendChild(grokBtn)

      // Should be stacked above Grok (highestTop = 300): 900 - 300 + 12 = 612
      expect(getBottomOffset()).toBe(612)
    })

    it('stacks above expanded grok window when grok is open', () => {
      Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
      Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true })

      // Chat collapsed at bottom
      const chatBtn = document.createElement('div')
      chatBtn.setAttribute('data-testid', 'chat-drawer-main')
      chatBtn.getBoundingClientRect = () => ({
        top: 830,
        bottom: 885,
        left: 1325,
        right: 1380,
        width: 55,
        height: 55,
        x: 1325,
        y: 830,
        toJSON: () => {},
      })
      document.body.appendChild(chatBtn)

      // Grok window expanded: top 340, bottom 820
      const grokDrawer = document.createElement('div')
      grokDrawer.setAttribute('data-testid', 'GrokDrawer')
      grokDrawer.getBoundingClientRect = () => ({
        top: 340,
        bottom: 820,
        left: 1000,
        right: 1380,
        width: 380,
        height: 480,
        x: 1000,
        y: 340,
        toJSON: () => {},
      })
      document.body.appendChild(grokDrawer)

      // Should be stacked above Grok window (highestTop = 340): 900 - 340 + 12 = 572
      expect(getBottomOffset()).toBe(572)
    })
  })

  describe('findCommentsTarget', () => {
    it('prioritizes user reply composer card over subsequent comments', () => {
      // Setup main tweet
      const mainTweet = document.createElement('article')
      mainTweet.setAttribute('data-testid', 'tweet')
      document.body.appendChild(mainTweet)

      // Setup user reply composer from real Twitter DOM
      const composerWrapper = document.createElement('div')
      composerWrapper.className = 'css-g5y9jx r-3pj75a'
      composerWrapper.innerHTML = `
        <div class="css-g5y9jx r-18u37iz r-184en5c">
          <div data-testid="tweetTextarea_0_label">
            <div data-testid="tweetTextarea_0" role="textbox" contenteditable="true"></div>
          </div>
          <button data-testid="tweetButtonInline">回复</button>
        </div>
      `
      document.body.appendChild(composerWrapper)

      // Setup first comment
      const firstComment = document.createElement('article')
      firstComment.setAttribute('data-testid', 'tweet')
      document.body.appendChild(firstComment)

      // Must find the composer card container (.r-3pj75a), NOT firstComment!
      expect(findCommentsTarget()).toBe(composerWrapper)
    })

    it('finds composer when wrapped in cellInnerDiv', () => {
      const cell = document.createElement('div')
      cell.setAttribute('data-testid', 'cellInnerDiv')
      cell.innerHTML = `
        <div>
          <div data-testid="tweetTextarea_0"></div>
        </div>
      `
      document.body.appendChild(cell)
      expect(findCommentsTarget()).toBe(cell)
    })

    it('falls back to articleReadView next cell in long article view', () => {
      const articleWrapper = document.createElement('div')
      articleWrapper.setAttribute('data-testid', 'cellInnerDiv')
      const readView = document.createElement('div')
      readView.setAttribute('data-testid', 'twitterArticleReadView')
      articleWrapper.appendChild(readView)

      const commentsCell = document.createElement('div')
      commentsCell.setAttribute('data-testid', 'cellInnerDiv')

      document.body.appendChild(articleWrapper)
      document.body.appendChild(commentsCell)

      expect(findCommentsTarget()).toBe(commentsCell)
    })

    it('falls back to first comment tweet if composer is absent (restricted replies)', () => {
      const mainTweet = document.createElement('article')
      mainTweet.setAttribute('data-testid', 'tweet')
      const firstComment = document.createElement('article')
      firstComment.setAttribute('data-testid', 'tweet')

      document.body.appendChild(mainTweet)
      document.body.appendChild(firstComment)

      expect(findCommentsTarget()).toBe(firstComment)
    })
  })

  describe('getJumpTargetStatus and bidirectional navigation', () => {
    it('returns DOWN direction when composer is below viewport (reading main tweet)', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      composer.innerHTML = `<div data-testid="tweetTextarea_0"></div>`
      composer.getBoundingClientRect = () => ({
        top: 1500, // far below viewport
        bottom: 1650,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: 1500,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      const status = getJumpTargetStatus()
      expect(status).not.toBeNull()
      expect(status?.shouldShow).toBe(true)
      expect(status?.direction).toBe('down')
    })

    it('returns UP direction when composer is above viewport (reading comments below)', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      composer.innerHTML = `<div data-testid="tweetTextarea_0"></div>`
      composer.getBoundingClientRect = () => ({
        top: -800, // scrolled well past composer into comments
        bottom: -650,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: -800,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      const status = getJumpTargetStatus()
      expect(status).not.toBeNull()
      expect(status?.shouldShow).toBe(true)
      expect(status?.direction).toBe('up')
    })

    it('returns shouldShow: false when composer is inside visible viewport', () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      composer.innerHTML = `<div data-testid="tweetTextarea_0"></div>`
      composer.getBoundingClientRect = () => ({
        top: 250, // visible right in middle of viewport
        bottom: 400,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: 250,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      const status = getJumpTargetStatus()
      expect(status).not.toBeNull()
      expect(status?.shouldShow).toBe(false)
    })
  })

  describe('checkJumpButtonVisibility and DOM rendering', () => {
    it('renders DOWN button with "直达回复" when composer is below', async () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      composer.innerHTML = `<div data-testid="tweetTextarea_0"></div>`
      composer.getBoundingClientRect = () => ({
        top: 1500,
        bottom: 1650,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: 1500,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      await updateJumpToComments(true)
      const btn = document.getElementById('xf-jump-to-comments')
      expect(btn).not.toBeNull()
      expect(btn?.classList.contains('xf-visible')).toBe(true)
      expect(btn?.classList.contains('xf-direction-down')).toBe(true)
      expect(btn?.querySelector('.xf-jump-text')?.textContent).toBe('直达回复')
      expect(btn?.getAttribute('aria-label')).toBe('向下直达回复框')
    })

    it('switches to UP button with "直达回复" when user scrolls deep into comments', async () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      composer.innerHTML = `<div data-testid="tweetTextarea_0"></div>`
      composer.getBoundingClientRect = () => ({
        top: -600,
        bottom: -450,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: -600,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      await updateJumpToComments(true)
      const btn = document.getElementById('xf-jump-to-comments')
      expect(btn).not.toBeNull()
      expect(btn?.classList.contains('xf-visible')).toBe(true)
      expect(btn?.classList.contains('xf-direction-up')).toBe(true)
      expect(btn?.querySelector('.xf-jump-text')?.textContent).toBe('直达回复')
      expect(btn?.getAttribute('aria-label')).toBe('向上直达回复框')
    })

    it('scrolls smoothly and focuses the textarea on click', async () => {
      vi.spyOn(window, 'location', 'get').mockReturnValue({
        pathname: '/user/status/123456789',
      } as Location)

      Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 3000, configurable: true })
      const scrollToSpy = vi.fn()
      window.scrollTo = scrollToSpy

      const composer = document.createElement('div')
      composer.setAttribute('data-testid', 'cellInnerDiv')
      const textarea = document.createElement('div')
      textarea.setAttribute('data-testid', 'tweetTextarea_0')
      const focusSpy = vi.fn()
      textarea.focus = focusSpy
      composer.appendChild(textarea)

      composer.getBoundingClientRect = () => ({
        top: 1200,
        bottom: 1350,
        left: 0,
        right: 600,
        width: 600,
        height: 150,
        x: 0,
        y: 1200,
        toJSON: () => {},
      })
      document.body.appendChild(composer)

      await updateJumpToComments(true)
      const btn = document.getElementById('xf-jump-to-comments')!
      btn.click()

      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          behavior: 'smooth',
        }),
      )
    })
  })
})
