<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AlphaLogo from '../components/AlphaLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ConnectWalletButton from '../components/ConnectWalletButton.vue'
import InviterModal from '../components/InviterModal.vue'
import config from '../assets/config'
import { bindInviter, claimDailyTokens, getNextClaimTime, updatePendingTokens, claimPendingTokens } from '../utils/useEthWallet'
import { useWalletStore } from '../stores/wallet'
import toast from '../utils/toast'

const { t } = useI18n()
const walletStore = useWalletStore()
const countdown = ref('')
const pendingTokens = ref<string>('0')
let timer: number | null = null

// 控制邀请人弹窗显示
const showInviterModal = ref(false)
const isClaimable = ref(true)

// 打开邀请人弹窗
const openInviterModal = () => {
  showInviterModal.value = true
}

// 更新倒计时
const updateCountdown = async () => {
  if (!walletStore.address || !walletStore.hasUpline) return

  const nextTime = await getNextClaimTime()
  if (!nextTime) return

  const now = Math.floor(Date.now() / 1000)
  const diff = nextTime - now

  if (diff <= 0) {
    isClaimable.value = true
    countdown.value = ''
    return
  }

  isClaimable.value = false
  const hours = Math.floor(diff / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  countdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 更新显示的待领取代币数量
const refreshPendingTokens = async () => {
  pendingTokens.value = await updatePendingTokens();
}

// 启动定时器
const startTimer = () => {
  if (timer) return
  updateCountdown()
  refreshPendingTokens()
  timer = window.setInterval(()=>{
    updateCountdown()
    refreshPendingTokens()
  }, 1000)
}

// 停止定时器
const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 领取待领取的代币
const handleClaimPendingTokens = async () => {
  if (!walletStore.address) {
    // 如果未连接钱包，显示连接钱包提示
    const connectButton = document.querySelector('.btn-connect');
    if (connectButton) {
      connectButton.classList.add('animate-pulse');
      setTimeout(() => {
        connectButton.classList.remove('animate-pulse');
      }, 1000);
    }
    return;
  }

  const result = await claimPendingTokens(t);
  if (!result.status) {
    console.error(result.message);
  } else {
    // 更新待领取代币数量
    refreshPendingTokens();
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  stopTimer()
})

// 关闭邀请人弹窗
const closeInviterModal = () => {
  showInviterModal.value = false
}

// 确认绑定邀请人
const confirmInviter = async (address: string) => {
  const result = await bindInviter(address, t)
  if (result.status) {
    walletStore.setUplineStatus(true)
    refreshPendingTokens()
  } else {
    // 显示错误提示
    toast.error(result.message)
  }
  closeInviterModal()
}

// 签到领取
const handleClaim = async () => {
  if (!walletStore.address) {
    // 如果未连接钱包，显示连接钱包提示
    const connectButton = document.querySelector('.btn-connect');
    if (connectButton) {
      connectButton.classList.add('animate-pulse');
      setTimeout(() => {
        connectButton.classList.remove('animate-pulse');
      }, 1000);
    }
    return;
  }

  // 如果在倒计时中，显示购买太频繁的提示
  if (countdown.value) {
    toast.info(t('common.errors.purchase_too_frequent'))
    return
  }

  const result = await claimDailyTokens(t);
  if (!result.status) {
    console.error(result.message);
  } else {
    // 更新待领取代币数量
    refreshPendingTokens()
  }
}
</script>

<template>
  <div class="min-h-screen bg-alpha-surface pb-16 relative overflow-hidden">
    <!-- 背景图片 -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
      :style="{ backgroundImage: `url('${config.backgrounds.home}')` }"
    ></div>

    <!-- 蓝金风格叠加层 -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-black/70 to-amber-800/40 z-5"></div>

    <!-- 动态光效背景 -->
    <div class="absolute inset-0 opacity-30 z-5">
      <div class="absolute top-20 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 right-20 w-48 h-48 bg-amber-500 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.5s;"></div>
      <div class="absolute bottom-32 left-1/3 w-56 h-56 bg-blue-400 rounded-full blur-3xl animate-pulse" style="animation-delay: 3s;"></div>
    </div>

    <!-- 内容层 -->
    <div class="relative z-10">
      <!-- Header -->
      <header class="p-4 relative">
        <div class="flex justify-between items-center mb-4">
          <AlphaLogo />
          <LanguageSwitcher />
        </div>
        <div class="absolute right-0 mt-2">
          <ConnectWalletButton @showInviterModal="openInviterModal" />
        </div>
      </header>

      <!-- Main Content - 紧凑布局 -->
      <div class="px-6 py-8 mt-8 space-y-8">

        <!-- 签到领取区域 - 使用logo -->
        <div class="text-center relative">
          <!-- Logo图标展示 -->
          <div class="relative mb-6">
            <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-amber-500 flex items-center justify-center shadow-2xl relative p-3">
              <!-- 内部光泽 -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-transparent"></div>
              <!-- Logo图片 -->
              <img
                :src="config.logo.path"
                :alt="config.logo.alt"
                class="w-full h-full object-contain z-10"
              />
              <!-- 旋转光环 -->
              <div class="absolute -inset-3 border-3 border-amber-400/40 rounded-full animate-spin"></div>
              <div class="absolute -inset-6 border-2 border-blue-400/30 rounded-full animate-spin" style="animation-duration: 3s; animation-direction: reverse;"></div>
            </div>
          </div>

          <!-- 标题文字 -->
          <h1 :class="[
            'font-bold mb-4 bg-gradient-to-r from-blue-400 via-amber-300 to-blue-500 bg-clip-text text-transparent drop-shadow-lg',
            $i18n.locale === 'en' ? 'text-3xl' : 'text-4xl'
          ]">{{ t('home.daily_claim') }}</h1>

          <p :class="[
            'text-blue-200/90 mb-6 drop-shadow-lg font-medium',
            $i18n.locale === 'en' ? 'text-base' : 'text-lg'
          ]">{{ t('home.claim_description') }}</p>

          <!-- 签到按钮 - 缩小尺寸 -->
          <div class="relative">
            <button
              @click="handleClaim"
              class="px-8 py-3 text-white font-bold text-lg relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl group"
              :class="countdown ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500'"
              :style="countdown ? '' : 'box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(245, 158, 11, 0.3)'"
            >
              <!-- 发光效果 -->
              <div v-if="!countdown" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>

              <span v-if="!countdown" class="relative z-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t('home.claim_button') }}
              </span>
              <span v-else class="text-blue-300 font-mono text-lg">{{ countdown }}</span>
            </button>
          </div>
        </div>

        <!-- 待领取代币区域 - 整合到按钮中 -->
        <div class="text-center relative">
          <!-- 标题 -->
          <h2 :class="[
            'font-bold mb-6 text-blue-300 drop-shadow-lg',
            $i18n.locale === 'en' ? 'text-xl' : 'text-2xl'
          ]">{{ t('home.pending_claim') }}</h2>

          <!-- 领取按钮 - 包含代币数量 -->
          <button
            @click="handleClaimPendingTokens"
            class="px-8 py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden shadow-xl bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 group min-w-64"
            style="box-shadow: 0 0 25px rgba(59, 130, 246, 0.5), 0 0 50px rgba(245, 158, 11, 0.3)"
          >
            <!-- 按钮光效 -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>

            <!-- 按钮内容 -->
            <div class="relative z-10 flex flex-col items-center">
              <!-- 代币数量 -->
              <div class="flex items-center justify-center mb-1">
                <span :class="[
                  'font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 mr-2',
                  $i18n.locale === 'en' ? 'text-2xl' : 'text-3xl'
                ]">{{ pendingTokens }}</span>
                <span class="text-xl text-amber-200 font-bold">RWA</span>
              </div>

              <!-- 操作文字 -->
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ t('home.claim_token') }}</span>
              </div>
            </div>
          </button>
        </div>

      </div>
    </div>

    <!-- 邀请人弹窗 -->
    <InviterModal
      :show="showInviterModal"
      @close="closeInviterModal"
      @confirm="confirmInviter"
    />
  </div>
</template>

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
    font-size: 2rem;
    line-height: 1;
  }

  .text-3xl {
    font-size: 1.875rem;
    line-height: 1;
  }

  .text-2xl {
    font-size: 1.5rem;
    line-height: 1;
  }

  .text-xl {
    font-size: 1.25rem;
    line-height: 1;
  }
}
</style>
