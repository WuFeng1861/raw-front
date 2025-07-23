<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import AlphaLogo from '../components/AlphaLogo.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import config from '../assets/config'
import { getContributions, getTeamSize, claimBNBReward, getDirectRefsList } from '../utils/useEthWallet'
import { useWalletStore } from '../stores/wallet'
import Clipboard from "clipboard";

const { t } = useI18n()
const walletStore = useWalletStore()
const showCopied = ref(false)
const contributions = ref({amount: '0', level: 0, received: '0'})
const teamSize = ref('0')
const directRefs = ref<Array<{address: string; count: number}>>([])
const currentPage = ref(1)
const pageSize = 10

// 计算要显示的分页按钮
const paginationButtons = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  // 当总页数小于等于5页时，显示所有页码
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  // 当当前页在前2页时，显示前3页 + ... + 最后一页
  if (current <= 2) {
    return [1, 2, 3, '...', total]
  }

  // 当当前页在第3页时，显示前4页 + ... + 最后一页
  if (current === 3) {
    return [1, 2, 3, 4, '...', total]
  }

  // 当当前页在第4页时，显示1 + ... + 3,4,5 + ... + 最后一页
  if (current === 4) {
    return [1, '...', 3, 4, 5, '...', total]
  }

  // 当当前页在倒数第3页时，显示第1页 + ... + 最后4页
  if (current === total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total]
  }

  // 当前页在最后2页时，显示第1页 + ... + 最后3页
  if (current > total - 2) {
    return [1, '...', total - 2, total - 1, total]
  }

  // 其他情况显示第1页 + ... + 当前页及其前后页 + ... + 最后一页
  return [1, '...', current - 1, current, current + 1, '...', total]
})

// 计算当前页的直推列表
const paginatedDirectRefs = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return directRefs.value.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(directRefs.value.length / pageSize)
})

// 切换页面
const changePage = (page: number) => {
  currentPage.value = page
}

const inviteLink = computed(() => {
  if (!walletStore.address) return '';
  const baseUrl = window.location.origin;
  return `${baseUrl}?upper=${walletStore.address}`;
})
let contributionsTimer: number | null = null
let teamSizeTimer: number | null = null
let directRefsTimer: number | null = null

// 更新贡献点显示
const updateContributions = async () => {
  if (walletStore.address && walletStore.hasUpline) {
    contributions.value = await getContributions()
  }
}

// 更新团队规模显示
const updateTeamSize = async () => {
  if (walletStore.address && walletStore.hasUpline) {
    teamSize.value = await getTeamSize()
  }
}

// 更新直推列表显示
const updateDirectRefs = async () => {
  if (walletStore.address && walletStore.hasUpline) {
    directRefs.value = await getDirectRefsList()
  }
}

// 启动定时器，更新贡献点
const startContributionsTimer = () => {
  if (contributionsTimer) return
  updateContributions()
  contributionsTimer = window.setInterval(updateContributions, 1000)
}

// 启动定时器，更新团队规模
const startTeamSizeTimer = () => {
  if (teamSizeTimer) return
  updateTeamSize()
  teamSizeTimer = window.setInterval(updateTeamSize, 1000)
}

// 启动定时器，更新直推列表
const startDirectRefsTimer = () => {
  if (directRefsTimer) return
  updateDirectRefs()
  directRefsTimer = window.setInterval(updateDirectRefs, 1000)
}

// 停止定时器
const stopContributionsTimer = () => {
  if (contributionsTimer) {
    clearInterval(contributionsTimer)
    contributionsTimer = null
  }
}

const stopTeamSizeTimer = () => {
  if (teamSizeTimer) {
    clearInterval(teamSizeTimer)
    teamSizeTimer = null
  }
}

const stopDirectRefsTimer = () => {
  if (directRefsTimer) {
    clearInterval(directRefsTimer)
    directRefsTimer = null
  }
}

onMounted(() => {
  startContributionsTimer()
  startTeamSizeTimer()
  startDirectRefsTimer()
})

onUnmounted(() => {
  stopContributionsTimer()
  stopTeamSizeTimer()
  stopDirectRefsTimer()
})

const copyInviteLink = () => {
  // 复制邀请链接到剪贴板
  let text = inviteLink.value;
  if (text) {
    const clipboard = new Clipboard('#copyFriendsLink', {
      text: () => text,
    })
    clipboard.on('success', (e) => {
      showCopied.value = true
      setTimeout(() => {
        showCopied.value = false
      }, 2000)
      clipboard.destroy()
    })
    clipboard.on('error', function(e) {
      console.log('copy failed')
      clipboard.destroy()
    });
  }
}
// 领取BNB奖励
const handleClaimBNB = async () => {
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

  const result = await claimBNBReward(t);
  if (!result.status) {
    console.error(result.message);
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-16 relative overflow-hidden">
    <!-- 背景图片 -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
      :style="{ backgroundImage: `url('${config.backgrounds.friends}')` }"
    ></div>

    <!-- 动态装饰背景 -->
    <div class="absolute inset-0 opacity-20 z-5">
      <div class="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 right-10 w-48 h-48 bg-indigo-400 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-32 left-1/3 w-56 h-56 bg-violet-500 rounded-full blur-3xl animate-pulse" style="animation-delay: 4s;"></div>
    </div>

    <!-- 内容层 -->
    <div class="relative z-10">
      <!-- 带模糊背景的页头 -->
      <header class="p-4 relative backdrop-blur-sm">
        <div class="flex justify-between items-center mb-4">
          <AlphaLogo />
          <LanguageSwitcher />
        </div>
      </header>

      <!-- 主要内容 -->
      <div class="px-6 py-4 space-y-6">

        <!-- 顶部统计卡片组 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 等级卡片 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div class="relative bg-black/60 backdrop-blur-md border border-purple-400/30 rounded-2xl p-4 transform transition-all duration-300 group-hover:scale-105">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-purple-300 text-xs font-medium">{{ t('friends.current_level') }}</p>
                  <p class="text-white text-lg font-bold">Lv{{ contributions.level }}</p>
                  <p class="text-purple-200 text-xs">({{Number(contributions.received) > 0 ? `${Number(contributions.received)+Number(contributions.amount)}`: `${Number(contributions.amount)}`}})</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 团队规模卡片 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div class="relative bg-black/60 backdrop-blur-md border border-indigo-400/30 rounded-2xl p-4 transform transition-all duration-300 group-hover:scale-105">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="text-left">
                  <p class="text-indigo-300 text-xs font-medium">{{ t('friends.team_size') }}</p>
                  <p class="text-white text-lg font-bold">{{ teamSize }}</p>
                  <p class="text-indigo-200 text-xs">{{ t('friends.people') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主要内容卡片 -->
        <div class="space-y-6">

          <!-- 直推列表 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl blur opacity-50 group-hover:opacity-70 transition duration-300"></div>
            <div class="relative bg-black/70 backdrop-blur-md border border-violet-400/30 rounded-3xl p-6">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-white">{{ t('friends.livestream_list') }}</h3>
              </div>

              <div v-if="!walletStore.address" class="text-center py-8">
                <p class="text-violet-300 text-lg">{{ t('friends.connect_wallet_view') }}</p>
              </div>

              <div v-else class="space-y-3">
                <div v-for="ref in paginatedDirectRefs" :key="ref.address"
                     class="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-violet-300/20 hover:border-violet-300/40 transition-all duration-300">
                  <div class="flex justify-between items-center">
                    <span class="text-white font-mono">{{ ref.address.slice(0, 6) }}...{{ ref.address.slice(-4) }}</span>
                    <span class="text-violet-300 font-semibold">{{ ref.count }} {{ t('friends.people') }}</span>
                  </div>
                </div>

                <div v-if="paginatedDirectRefs.length === 0" class="text-center text-violet-400 py-6">
                  暂无直推
                </div>

                <!-- 分页控制 -->
                <div v-if="directRefs.length > 0" class="flex justify-center items-center gap-2 mt-6">
                  <template v-for="(item, index) in paginationButtons" :key="item + index + index.toString()">
                    <span v-if="item === '...'" class="px-2 text-violet-400">...</span>
                    <button
                      v-else
                      @click="changePage(item)"
                      :class="[
                        'w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-110',
                        Number(currentPage) === Number(item)
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                          : 'bg-black/30 text-violet-300 hover:bg-black/50 border border-violet-400/20'
                      ]"
                    >
                      {{ item }}
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 紧凑型收益领取卡片 -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-300"></div>
            <div class="relative bg-black/70 backdrop-blur-md border border-amber-400/30 rounded-2xl p-4">
              <!-- BNB收益展示区 -->
              <div class="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 mb-4 border border-amber-400/30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                      <img
                        src="https://wufeng98.cn/imgServerApi/images/7151f34e-2b93-4684-91e9-c74d25d1c70f.png"
                        alt="BNB"
                        class="w-8 h-8"
                      />
                    </div>
                    <div class="text-left">
                      <div class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
                        {{ Number((Number(contributions.amount) * 0.00003).toFixed(6)) }}
                      </div>
                      <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="text-amber-300 text-sm font-semibold">{{ contributions.amount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 按钮组 -->
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="handleClaimBNB"
                  class="py-3 text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg hover:shadow-xl"
                >
                  {{ t('friends.claim_bnb') }}
                </button>

                <div class="relative">
                  <button
                    @click="copyInviteLink"
                    class="w-full py-3 text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg hover:shadow-xl"
                    id="copyFriendsLink"
                  >
                    {{ t('friends.copyLink') }}
                  </button>

                  <div
                    v-if="showCopied"
                    class="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs animate-bounce z-20"
                  >
                    {{ t('common.copied') }}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保文本渐变效果 */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* 增强悬停效果 */
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

/* 卡片悬停缩放效果 */
.transform:hover {
  transform: scale(1.02);
}

/* 按钮光效 */
button:hover {
  filter: brightness(1.1);
}

/* 响应式字体调整 */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2rem;
  }

  .text-2xl {
    font-size: 1.5rem;
  }

  .text-xl {
    font-size: 1.25rem;
  }
}
</style>
