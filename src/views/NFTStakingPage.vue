<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {ref, onMounted, onUnmounted} from 'vue';
import {useRouter} from 'vue-router';
import AlphaLogo from '../components/AlphaLogo.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import AddressInputModal from '../components/AddressInputModal.vue';
import config from '../assets/config';
import {useWalletStore} from '../stores/wallet';
import {
  claimPoolDividends,
  getNFTStakingDataWithCache,
  getPoolDividendsWithCache,
  transferPoolOwner,
  type NFTStakingData
} from '../utils/useStaking';
import toast from '../utils/toast';

const {t} = useI18n();
const router = useRouter();
const walletStore = useWalletStore();

// 格式化数字，保留两位小数但去除尾部的0和小数点
const formatNumber = (num: string | number): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';

  // 保留两位小数
  const formatted = numValue.toFixed(2);
  // 去除尾部的0和小数点
  return formatted.replace(/\.?0+$/, '');
};

// NFT质押数据
const nftStakingList = ref<NFTStakingData[]>([]);
const isLoading = ref(false);

// 控制地址输入弹窗显示
const showAddressModal = ref(false);
// 当前要转移的NFT质押记录
const currentTransferNFT = ref<NFTStakingData | null>(null);

// 定时器
let nftStakingTimer: number | null = null;
let dividendsTimer: number | null = null;

// 更新NFT质押数据
const updateNFTStakingData = async (forceUpdate: boolean = false) => {
  if (!walletStore.address) {
    nftStakingList.value = [];
    return;
  }

  if (!forceUpdate && isLoading.value) {
    return; // 防止重复请求
  }

  try {
    isLoading.value = true;
    console.log('开始更新NFT质押数据...');
    const data = await getNFTStakingDataWithCache(forceUpdate, t);
    nftStakingList.value = data;
    console.log('NFT质押数据更新完成:', data);
  } catch (error) {
    console.error('更新NFT质押数据失败:', error);
    nftStakingList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 更新可领取收益数据
const updateClaimableRewards = async (forceUpdate: boolean = false) => {
  if (!walletStore.address || nftStakingList.value.length === 0) {
    return;
  }

  try {
    console.log('开始更新可领取收益数据...');

    // 并发获取所有质押池的可领取收益
    const promises = nftStakingList.value.map(async (nft) => {
      const claimableReward = await getPoolDividendsWithCache(nft.poolId, forceUpdate);
      return {id: nft.id, claimableReward};
    });

    const rewardsResults = await Promise.all(promises);

    // 更新NFT质押列表中的可领取收益数据
    nftStakingList.value.forEach(nft => {
      const result = rewardsResults.find(r => r.id === nft.id);
      if (result) {
        nft.claimableReward = result.claimableReward;
      }
    });

    console.log('可领取收益数据更新完成');
  } catch (error) {
    console.error('更新可领取收益数据失败:', error);
  }
};

// 启动定时器更新NFT质押数据
const startNFTStakingTimer = () => {
  if (nftStakingTimer) return;
  updateNFTStakingData(true); // 立即执行一次
  nftStakingTimer = window.setInterval(() => {
    updateNFTStakingData(); // 每5分钟更新一次
  }, 5 * 60 * 1000);
};

// 启动定时器更新可领取收益数据
const startDividendsTimer = () => {
  if (dividendsTimer) return;
  updateClaimableRewards(true); // 立即执行一次
  dividendsTimer = window.setInterval(() => {
    updateClaimableRewards(); // 每30秒更新一次收益
  }, 30000);
};

// 停止定时器
const stopNFTStakingTimer = () => {
  if (nftStakingTimer) {
    clearInterval(nftStakingTimer);
    nftStakingTimer = null;
  }
};

const stopDividendsTimer = () => {
  if (dividendsTimer) {
    clearInterval(dividendsTimer);
    dividendsTimer = null;
  }
};

onMounted(() => {
  console.log(2);
  startNFTStakingTimer();
  startDividendsTimer();
});

onUnmounted(() => {
  console.log(3);
  stopNFTStakingTimer();
  stopDividendsTimer();
});

// 返回上一页
const goBack = () => {
  router.back();
};

// 处理领取按钮
const handleClaim = async (id: number, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  await claimPoolDividends(id.toString(), t);
};

// 处理转移按钮
const handleTransfer = (nft: NFTStakingData, event?: Event) => {
  if (event) {
    event.stopPropagation();
  }
  // 保存当前要转移的NFT记录
  currentTransferNFT.value = nft;
  // 显示地址输入弹窗
  showAddressModal.value = true;
};

// 关闭地址输入弹窗
const closeAddressModal = () => {
  showAddressModal.value = false;
  currentTransferNFT.value = null;
};

// 确认转移地址
const confirmTransfer = async (address: string) => {
  if (!currentTransferNFT.value) {
    toast.error('转移信息错误，请重试');
    return;
  }

  if (!walletStore.address) {
    toast.error(t('common.errors.wallet_not_connected'));
    return;
  }

  try {
    toast.info('开始转移分红地址，请在钱包中确认交易...');

    // 调用转移分红地址的函数
    const result = await transferPoolOwner(
        currentTransferNFT.value.poolId,
        address,
        t
    );

    if (result.status) {
      toast.success(result.message);

      // 转移成功后强制更新NFT质押数据
      await updateNFTStakingData(true);

      console.log(`成功将质押池 ${currentTransferNFT.value.poolId} 的分红地址转移到 ${address}`);
    } else {
      toast.error(result.message);
    }
  } catch (error) {
    console.error('转移分红地址失败:', error);
    toast.error('转移失败，请重试');
  } finally {
    // 关闭弹窗
    closeAddressModal();
  }
};

// 处理NFT卡片点击
const handleNFTCardClick = (nft: any) => {
};
</script>

<template>
  <div class="min-h-screen bg-alpha-surface pb-16 relative">
    <!-- 背景图片 -->
    <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        :style="{ backgroundImage: `url('${config.backgrounds.friends}')` }"
    ></div>

    <!-- 内容层 -->
    <div class="relative z-10">
      <!-- Header -->
      <header class="p-4 relative">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center">
            <!-- 返回按钮 -->
            <button @click="goBack" class="mr-3 p-2 rounded-full bg-alpha-surface-light bg-opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <AlphaLogo/>
          </div>
          <LanguageSwitcher/>
        </div>
      </header>

      <!-- Main Content -->
      <div class="px-4 py-6">
        <!-- 标题 -->
        <h1 class="text-3xl font-bold mb-4 text-left" style="color: #FFD700; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">
          {{ t('staking.title') }}
        </h1>

        <!-- 绿色背景容器 - 与质押合约页面保持一致 -->
        <div class="rounded-3xl p-6 mb-8 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-2xl border border-amber-300">

          <!-- 我的质押按钮 - 金色主题 -->
          <button class="w-full mb-6 py-4 text-amber-900 font-bold text-lg rounded-full flex items-center justify-center bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 shadow-lg transition-all duration-300">
            <span>{{ t('staking.my_staking_pool') }}</span>
            <div class="ml-2 bg-amber-300 bg-opacity-50 rounded-full px-3 py-1">
              <span class="text-amber-900 text-sm font-bold">{{ nftStakingList.length }}{{ t('staking.cards_count') }}</span>
            </div>
          </button>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="text-center py-12">
            <div class="inline-flex items-center px-6 py-3 font-semibold text-sm shadow-lg rounded-full bg-amber-400 text-amber-900">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ t('common.loading') }}
            </div>
          </div>

          <!-- 暂无NFT质押状态 -->
          <div v-else-if="!walletStore.address" class="text-center py-12">
            <div class="bg-amber-50 bg-opacity-20 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-amber-200">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-200 bg-opacity-50 flex items-center justify-center">
                <svg class="h-10 w-10 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-amber-900 mb-3">{{ t('staking.connect_wallet_to_view') }}</h3>
              <p class="text-amber-700 text-base">{{ t('staking.connect_wallet_to_view_nft') }}</p>
            </div>
          </div>

          <!-- 暂无NFT质押记录 -->
          <div v-else-if="nftStakingList.length === 0" class="text-center">
            <div class="bg-amber-50 bg-opacity-20 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-amber-200">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-200 bg-opacity-50 flex items-center justify-center">
                <svg class="h-10 w-10 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-amber-900 mb-3">{{ t('staking.no_nft_staking_records') }}</h3>
              <p class="text-amber-700 text-base mb-4">{{ t('staking.no_nft_staking_records_desc') }}</p>
              <p class="text-amber-600 text-sm">{{ t('staking.no_nft_staking_note') }}</p>
            </div>
          </div>

          <!-- NFT质押卡片列表 -->
          <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="nft in nftStakingList" :key="nft.id" @click="handleNFTCardClick(nft)"
                 class="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl p-6 shadow-xl border border-amber-300 hover:shadow-amber-400/50 transition-all duration-300">

              <!-- 卡片头部 - 等级标签和状态 -->
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg">
                    <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-amber-900">{{ t(`staking.${nft.level === '金卡' ? 'gold' : nft.level === '银卡' ? 'silver' : 'bronze'}_card`) }}{{nft.poolId}}</h3>
                    <p class="text-amber-700 text-sm">{{ t('staking.nft_staking_card') }}</p>
                  </div>
                </div>

                <div class="px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-md">
                  {{ t('staking.status_active') }}
                </div>
              </div>

              <!-- 主要信息区域 -->
              <div class="space-y-4 mb-6">
                <!-- 质押金额 -->
                <div class="bg-white bg-opacity-50 rounded-2xl p-5 border border-amber-200">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-amber-800 text-sm font-medium">{{ t('staking.staking_amount') }}</p>
                    <svg class="h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div class="flex items-baseline">
                    <p class="text-amber-900 font-black text-2xl">{{ formatNumber(nft.amount) }}</p>
                    <span class="text-amber-700 text-sm ml-2">RWA</span>
                  </div>
                </div>

                <!-- 可领取收益 -->
                <div class="bg-white bg-opacity-50 rounded-2xl p-5 border border-amber-200">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-amber-800 text-sm font-medium">{{ t('staking.claimable_reward') }}</p>
                    <svg class="h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <div class="flex items-baseline">
                    <p class="text-amber-900 font-black text-2xl">{{ formatNumber(nft.claimableReward) }}</p>
                    <span class="text-amber-700 text-sm ml-2">RWA</span>
                  </div>
                </div>
              </div>

              <!-- 详细数据网格 -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white bg-opacity-30 rounded-xl p-4 border border-amber-200">
                  <p class="text-amber-800 text-sm mb-1">{{ t('staking.annual_rate') }}</p>
                  <p class="font-bold text-lg text-amber-900">{{ nft.yearRate }}</p>
                </div>
                <div class="bg-white bg-opacity-30 rounded-xl p-4 border border-amber-200">
                  <p class="text-amber-800 text-sm mb-1">{{ t('staking.staking_dividend') }}</p>
                  <p class="text-amber-900 font-bold text-lg">{{ nft.stakingRate }}</p>
                </div>
              </div>

              <!-- 按钮组 -->
              <div class="grid grid-cols-2 gap-4">
                <button @click="handleClaim(nft.poolId, $event)"
                        class="py-3 text-amber-900 font-bold rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 shadow-lg transition-all duration-300">
                  {{ t('common.claim') }}
                </button>
                <button @click="handleTransfer(nft, $event)"
                        class="py-3 text-amber-800 font-bold rounded-full bg-white bg-opacity-50 border border-amber-300 hover:bg-opacity-70 transition-all duration-300">
                  {{ t('common.transfer') }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- 地址输入弹窗 -->
    <AddressInputModal
        :show="showAddressModal"
        :title="t('transfer.dividend_address')"
        :placeholder="t('transfer.enter_dividend_address')"
        @close="closeAddressModal"
        @confirm="confirmTransfer"
    />
  </div>
</template>

<style scoped>
/* 确保文本在深色背景上清晰可见 */
.text-white {
  color: #ffffff !important;
}

.text-gray-300 {
  color: #d1d5db !important;
}

.text-gray-400 {
  color: #9ca3af !important;
}

</style>

<style>
/* 金色渐变背景 */
.golden-glow {
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.1);
}
.text-gold {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
.border-gold {
  border-color: #FFD700;
}
</style>
