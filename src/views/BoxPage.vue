<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {ref, onMounted, onUnmounted} from 'vue';
import AlphaLogo from '../components/AlphaLogo.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import BoxRewardModal from '../components/BoxRewardModal.vue';
import config from '../assets/config';
import {useWalletStore} from '../stores/wallet';
import {getNextBoxTime, openBox, openTenBox} from '../utils/useEthWallet';
import Clipboard from 'clipboard';
import toast from '../utils/toast';

const {t} = useI18n();
const walletStore = useWalletStore();

// 控制奖励弹窗显示
const showRewardModal = ref(false);
const isShareReward = ref(false);
const countdown = ref('');
let timer: number | null = null;

// 更新倒计时
const updateCountdown = async () => {
  if (!walletStore.address || !walletStore.hasUpline) return;

  const nextTime = await getNextBoxTime();
  if (!nextTime) return;

  const now = Math.floor(Date.now() / 1000);
  const diff = nextTime - now;

  if (diff <= 0) {
    countdown.value = '';
    return;
  }

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  countdown.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 启动定时器
const startTimer = () => {
  if (timer) return;
  updateCountdown();
  timer = window.setInterval(updateCountdown, 1000);
};

// 停止定时器
const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

// 打开普通盲盒
const handleOpenBox = async () => {
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
    toast.info(t('common.errors.purchase_too_frequent'));
    return;
  }

  const result = await openBox(t);
  if (!result.status) {
    console.error(result.message);
    return;
  }

  isShareReward.value = false;
  showRewardModal.value = true;
};
// 打开十倍盲盒
const handleOpenTenBox = async () => {
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
    toast.info(t('common.errors.purchase_too_frequent'));
    return;
  }

  const result = await openTenBox(t);
  if (!result.status) {
    console.error(result.message);
    return;
  }

  isShareReward.value = true;
  showRewardModal.value = true;
};

// 关闭奖励弹窗
const closeRewardModal = () => {
  showRewardModal.value = false;
};

const copyQQLink = () => {
  console.log(config.qqGroup.number);
  // 复制邀请链接到剪贴板
  let text = config.qqGroup.number;
  if (text) {
    const clipboard = new Clipboard('#copyQQLink', {
      text: () => text,
    });
    clipboard.on('success', (e) => {
      toast.success(t('common.successTip.qq_link_copy_success'));
      clipboard.destroy();
    });
    clipboard.on('error', function (e) {
      clipboard.destroy();
    });
  }
};
</script>

<template>
  <div
      class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 pb-16 relative overflow-hidden">
    <!-- 背景图片 -->
    <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 z-0"
        :style="{ backgroundImage: `url('${config.backgrounds.box}')` }"
    ></div>

    <!-- 动态装饰背景 -->
    <div class="absolute inset-0 opacity-30 z-5">
      <div class="absolute top-32 left-16 w-80 h-80 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-2/3 right-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl animate-pulse"
           style="animation-delay: 2s;"></div>
      <div class="absolute bottom-40 left-1/4 w-72 h-72 bg-violet-500 rounded-full blur-3xl animate-pulse"
           style="animation-delay: 4s;"></div>
    </div>

    <!-- 内容层 -->
    <div class="relative z-10">
      <!-- Header -->
      <header class="p-4 relative">
        <div class="flex justify-between items-center mb-4">
          <AlphaLogo/>
          <LanguageSwitcher/>
        </div>
        <div class="absolute right-0 mt-2">
          <!--<ConnectWalletButton />-->
        </div>
      </header>

      <!-- Main Content -->
      <div class="px-6 py-8 relative flex flex-col min-h-[calc(100vh-140px)] justify-center">

        <!-- 中央神秘盒子区域 -->
        <div class="text-center mb-12">
          <!-- 神秘盒子图标 -->
          <div class="relative mb-8">
            <div
                class="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center shadow-2xl relative overflow-hidden group">
              <!-- 内部光泽 -->
              <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <!-- 盒子图标 -->
              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-16 w-16 text-white z-10 group-hover:scale-110 transition-transform duration-300" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <!-- 旋转装饰环 -->
              <div class="absolute -inset-4 border-4 border-purple-300/30 rounded-full animate-spin"></div>
              <div class="absolute -inset-8 border-2 border-violet-300/20 rounded-full animate-spin"
                   style="animation-duration: 4s; animation-direction: reverse;"></div>
              <!-- 闪烁粒子 -->
              <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
              <div class="absolute bottom-4 left-4 w-2 h-2 bg-blue-300 rounded-full animate-ping"
                   style="animation-delay: 1s;"></div>
            </div>
          </div>

          <!-- 标题 -->
          <h1 :class="[
          'font-black mb-4 bg-gradient-to-r from-purple-300 via-violet-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-lg',
          $i18n.locale === 'en' ? 'text-3xl' : 'text-4xl'
        ]">
            {{ t('box.title') }}
          </h1>
          <p :class="[
          'text-purple-200/90 mb-8 drop-shadow font-medium',
          $i18n.locale === 'en' ? 'text-base' : 'text-lg'
        ]">
            {{ t('box.subtitle') }}
          </p>
        </div>

        <!-- 盲盒操作区域 -->
        <div class="max-w-md mx-auto w-full">
          <!-- 操作卡片 -->
          <div class="relative group mb-8">
            <div
                class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
            <div class="relative bg-black/60 backdrop-blur-md border border-purple-400/30 rounded-3xl p-6">

              <!-- 按钮组 -->
              <div class="space-y-4 mb-6">
                <!-- 普通盲盒按钮 -->
                <button
                    @click="handleOpenBox"
                    class="w-full py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden shadow-xl group"
                    :class="countdown ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500'"
                    :style="countdown ? '' : 'box-shadow: 0 0 30px rgba(147, 51, 234, 0.6)'"
                >
                  <!-- 发光效果 -->
                  <div v-if="!countdown"
                       class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>

                  <span v-if="!countdown" class="relative z-10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                  </svg>
                  {{ t('box.open_box') }}
                </span>
                  <span v-else class="text-purple-200 font-mono text-lg">{{ countdown }}</span>
                </button>

                <!-- 十倍盲盒按钮 -->
                <!--<button-->
                <!--    @click="handleOpenTenBox"-->
                <!--    class="w-full py-4 text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden shadow-xl group"-->
                <!--    :class="countdown ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500'"-->
                <!--    :style="countdown ? '' : 'box-shadow: 0 0 30px rgba(99, 102, 241, 0.6)'"-->
                <!--&gt;-->
                <!--  &lt;!&ndash; 发光效果 &ndash;&gt;-->
                <!--  <div v-if="!countdown"-->
                <!--       class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-shimmer"></div>-->

                <!--  <span v-if="!countdown" class="relative z-10 flex items-center justify-center">-->
                <!--  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24"-->
                <!--       stroke="currentColor">-->
                <!--    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"-->
                <!--          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>-->
                <!--  </svg>-->
                <!--  {{ t('box.share_box') }}-->
                <!--</span>-->
                <!--  <span v-else class="text-indigo-200 font-mono text-lg">{{ countdown }}</span>-->
                <!--</button>-->
              </div>

              <!-- 描述文字 -->
              <div class="text-center">
                <div class="flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400 mr-2" fill="none"
                       viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-purple-300 text-sm font-medium">{{ t('box.game_rules') }}</span>
                </div>
                <p :class="[
                'text-purple-200/80 leading-relaxed',
                $i18n.locale === 'en' ? 'text-xs' : 'text-sm'
              ]">
                  {{ t('box.box_description') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="mt-auto pt-8">
          <div class="flex justify-center items-center text-purple-400/60 text-xs mb-4">
            <p>{{ t('box.footer') }}</p>
          </div>
          <div class="flex justify-center gap-6">
            <a
                v-for="link in config.socialLinks"
                :key="link.name"
                :href="link.url"
                :title="link.name"
                target="_blank"
                rel="noopener noreferrer"
                class="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 transition-all duration-300 hover:scale-110"
            >
              <svg v-if="link.icon === 'twitter'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor"
                   viewBox="0 0 24 24">
                <path
                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.059 10.059 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.16a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <svg v-if="link.icon === 'github'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor"
                   viewBox="0 0 24 24">
                <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <svg v-if="link.icon === 'telegram'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                   fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm2.784 14.184l-3.204 1.68c-.259.136-.47-.004-.47-.265v-7.206c0-.261.211-.401.47-.265l3.203 1.68c.259.136.26.355 0 .492l-3.204 1.68 3.204 1.68c.26.137.259.356 0 .492z"/>
              </svg>
            </a>
            <button @click="copyQQLink"
                    id="copyQQLink"
                    class="p-3 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 transition-all duration-300 hover:scale-110">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm2.784 14.184l-3.204 1.68c-.259.136-.47-.004-.47-.265v-7.206c0-.261.211-.401.47-.265l3.203 1.68c.259.136.26.355 0 .492l-3.204 1.68 3.204 1.68c.26.137.259.356 0 .492z"/>
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>

    <!-- 奖励弹窗 -->
    <BoxRewardModal
        :show="showRewardModal"
        :is-share="isShareReward"
        @close="closeRewardModal"
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
    font-size: 2.25rem;
    line-height: 1;
  }
}
</style>
