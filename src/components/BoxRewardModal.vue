<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义属性
defineProps<{
  show: boolean
  isShare: boolean // 是否是翻倍盲盒
}>()

// 定义事件
const emit = defineEmits<{
  close: []
}>()

// 关闭弹窗
const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="handleClose"></div>

      <!-- 弹窗内容 -->
      <div class="relative w-11/12 max-w-md rounded-2xl z-10" style="aspect-ratio: 0.74">
        <!-- 背景图片 -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
          style="background-image: url('https://wufeng98.cn/imgServerApi/images/b9bf9296-75b5-4773-a5af-df5c886ee57a.jpg')"
        ></div>

        <!-- 关闭按钮 -->
        <button
          @click="handleClose"
          class="absolute right-4 top-4 text-gray-200 hover:text-white z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

         标题
        <h3 class="text-2xl font-bold mb-6 text-center absolute top-10 left-0 right-0 z-10" style="color: white">
          {{ t('box.reward_title') }}
        </h3>

        <!-- 奖励内容 -->
        <div class="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-center z-10">
          <div class="flex flex-col gap-2">
            <p class="text-2xl font-bold text-white whitespace-nowrap">{{ t('box.reward_congrats') }}</p>
            <p class="text-2xl font-bold text-white whitespace-nowrap">{{ t('box.reward_got') }} {{ isShare ? '1000000' : '10000' }} {{ t('box.reward_alpha') }}</p>
          </div>
        </div>

        <!-- 确认按钮 -->
        <div class="absolute bottom-6 left-6 right-6 z-10">
          <button
            @click="handleClose"
            class="w-full py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden shadow-xl group bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
          >
            {{ t('box.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
/* 光效动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-out;
}

.group:hover .group-hover\:animate-shimmer {
  animation: shimmer 2s ease-out;
}

/* 文字渐变效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 增强阴影效果 */
.drop-shadow-lg {
  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
}

/* 按钮悬停增强 */
button:hover {
  filter: brightness(1.1);
}

/* 响应式调整 */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2.25rem;
    line-height: 1;
  }
}
</style>
