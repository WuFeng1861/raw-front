<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 定义属性
defineProps<{
  show: boolean
}>()

// 定义事件
const emit = defineEmits<{
  close: []
  confirm: [inviterAddress: string]
}>()

// 邀请人地址
const inviterAddress = ref(sessionStorage.getItem('upper') || '')

// 确认绑定邀请人
const handleConfirm = () => {
  emit('confirm', inviterAddress.value)
  inviterAddress.value = ''
  // 清除缓存的邀请人地址
  sessionStorage.removeItem('upper')
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
  inviterAddress.value = ''
  // 清除缓存的邀请人地址
  sessionStorage.removeItem('')
}
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" @click="handleClose"></div>

      <!-- 弹窗内容 -->
      <div class="relative w-full max-w-md bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl shadow-2xl border border-blue-400/30 overflow-hidden">

        <!-- 背景图片层 -->
        <div
            class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 z-0"
            style="background-image: url('https://wufeng98.cn/imgServerApi/images/d2b69a7b-282b-45c5-b58e-c5ab81a702ba.png')"
        ></div>

        <!-- 装饰性背景 -->
        <div class="absolute inset-0 opacity-10 z-5">
          <div class="absolute top-10 right-10 w-20 h-20 bg-yellow-400 rounded-full blur-2xl animate-pulse"></div>
          <div class="absolute bottom-10 left-8 w-16 h-16 bg-amber-400 rounded-full blur-xl animate-pulse" style="animation-delay: 1s;"></div>
        </div>

        <!-- 主要内容区域 -->
        <div class="relative p-6 z-10">

          <!-- 关闭按钮 -->
          <button
              @click="handleClose"
              class="absolute right-4 top-4 text-blue-200 hover:text-white transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- 顶部图标 -->
          <div class="flex justify-center mb-6 mt-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-yellow-400 flex items-center justify-center shadow-lg relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- 旋转光环 -->
              <div class="absolute -inset-1 border border-yellow-400/50 rounded-full animate-spin"></div>
            </div>
          </div>

          <!-- 标题和描述 -->
          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-300 via-yellow-300 to-blue-300 bg-clip-text text-transparent">
              {{ t('home.bind_inviter') }}
            </h3>
            <p class="text-blue-200 text-sm">
              {{ t('home.bind_inviter') }}
            </p>
          </div>

          <!-- 输入框 -->
          <div class="mb-6">
            <label class="block text-blue-200 text-sm font-medium mb-2 text-left">
              {{ t('home.inviter_address') }}
            </label>
            <input
                v-model="inviterAddress"
                type="text"
                :placeholder="t('home.inviter_address_placeholder')"
                class="w-full bg-black/30 text-white rounded-lg px-4 py-3 border border-blue-400/30 focus:outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm placeholder-blue-300/50"
            />
          </div>

          <!-- 确认按钮 -->
          <button
              @click="handleConfirm"
              class="w-full py-3 text-black font-bold text-lg rounded-lg transition-all duration-300 transform hover:scale-105 relative overflow-hidden shadow-lg group bg-gradient-to-r from-blue-400 via-yellow-400 to-blue-400"
          >
            <!-- 按钮光效 -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>

            <!-- 按钮内容 -->
            <div class="relative flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              {{ t('home.confirm_inviter') }}
            </div>
          </button>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* 光效动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%) skewX(-12deg);
  }
  100% {
    transform: translateX(200%) skewX(-12deg);
  }
}

.group:hover .group-hover\:animate-shimmer {
  animation: shimmer 1.5s ease-out;
}

/* 文字渐变效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 输入框样式优化 */
input::placeholder {
  color: rgba(147, 197, 253, 0.5) !important;
}

input:focus::placeholder {
  color: rgba(252, 211, 77, 0.6) !important;
}
</style>
