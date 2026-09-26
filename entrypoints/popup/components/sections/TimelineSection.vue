<script setup lang="ts">
import {
  KeyTweetButton,
  KeyNavigationButtonsLabels,
  KeySidebarColumn,
  KeyHighlightNonFollowers,
  KeyArticleToc,
  KeyScheduledPanorama,
  KeyJumpToComments,
} from '../../../../storage-keys'
import { STATIC_NAV_ITEMS } from '../../../../shared/staticNavIcons'
import TimelineWidthSlider from '../controls/TimelineWidthSlider.vue'
import ControlsWrapper from '../ui/ControlsWrapper.vue'
import SectionLabel from '../ui/SectionLabel.vue'
import Separator from '../ui/Separator.vue'
import IconButton from '../ui/IconButton.vue'
import ToggleGroupControl from '../ui/ToggleGroupControl.vue'

const displayControls = [
  {
    label: '发帖按钮',
    key: KeyTweetButton,
    options: [
      { value: 'on', label: '显示' },
      { value: 'off', label: '隐藏' },
    ],
  },
  {
    label: '右侧边栏',
    key: KeySidebarColumn,
    options: [
      { value: 'off', label: '显示' },
      { value: 'on', label: '隐藏' },
    ],
  },
  {
    label: '直达评论',
    key: KeyJumpToComments,
    options: [
      { value: 'on', label: '显示' },
      { value: 'off', label: '隐藏' },
    ],
  },
  {
    label: '未互关标记',
    key: KeyHighlightNonFollowers,
    options: [
      { value: 'on', label: '显示' },
      { value: 'off', label: '隐藏' },
    ],
  },
  {
    label: '文章目录',
    key: KeyArticleToc,
    options: [
      { value: 'on', label: '显示' },
      { value: 'off', label: '隐藏' },
    ],
  },
  {
    label: '排期全景',
    key: KeyScheduledPanorama,
    options: [
      { value: 'on', label: '显示' },
      { value: 'off', label: '隐藏' },
    ],
  },
]
</script>

<template>
 <section class="flex flex-col gap-3">
  <ControlsWrapper id="user-control-timeline">
   <TimelineWidthSlider />
   <Separator />

   <div class="flex flex-col gap-2.5 w-full">
    <div
     v-for="item in displayControls"
     :key="item.key"
     class="flex items-center justify-between w-full"
    >
     <span class="text-[12px] font-semibold text-color-text">{{ item.label }}</span>
     <ToggleGroupControl :storage-key="item.key" :options="item.options" />
    </div>
   </div>
  </ControlsWrapper>

  <ControlsWrapper id="user-control-navigation" class="!rounded-xl">
   <SectionLabel>导航栏按钮</SectionLabel>

   <div class="grid grid-cols-5 gap-y-2 gap-x-4 mx-auto flex-wrap">
    <IconButton
     v-for="item in STATIC_NAV_ITEMS"
     :key="item.storageKey"
     :storage-key="item.storageKey"
     :label="item.label"
     :icon-html="item.innerHTML"
     :view-box="item.viewBox"
    />
   </div>

   <Separator />
   <div class="flex items-center justify-between w-full">
    <span class="text-[12px] font-semibold text-color-text whitespace-nowrap">显示导航文本</span>
    <ToggleGroupControl
     :storage-key="KeyNavigationButtonsLabels"
     :options="[
      { value: 'never', label: '从不' },
      { value: 'hover', label: '悬停' },
      { value: 'always', label: '始终' },
     ]"
    />
   </div>
  </ControlsWrapper>

  <p class="text-xs text-center font-medium leading-5 text-secondary-text">
   更多 𝕏 显示设置
   <a href="https://twitter.com/i/display" target="_blank" rel="noreferrer" class="text-accent hover:underline">
    查看
   </a>。
  </p>
 </section>
</template>
