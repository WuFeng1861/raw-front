<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {ref, onMounted, onUnmounted} from 'vue';
import AlphaLogo from '../components/AlphaLogo.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import config from '../assets/config';
import {useRouter} from 'vue-router';
import {useWalletStore} from '../stores/wallet';
import {
  getUserStakesWithCache,
  getAllPoolsInfoWithCache,
  getBatchStakeDividendsWithCache,
  type ProcessedStakeRecord,
  type ProcessedPool
} from '../utils/useStaking';

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

// 用户质押数据
const myStakingList = ref<ProcessedStakeRecord[]>([]);
const stakingContracts = ref<ProcessedPool[]>([]);
const isLoading = ref(false);
const isLoadingPools = ref(false);

// 定时器
let stakingTimer: number | null = null;
let poolsTimer: number | null = null;
let dividendsTimer: number | null = null;

// 更新用户质押数据
const updateUserStakes = async (forceUpdate: boolean = false) => {
  if (!walletStore.address) {
    myStakingList.value = [];
    return;
  }

  if (!forceUpdate && isLoading.value) {
    return; // 防止重复请求
  }

  try {
    isLoading.value = true;
    console.log('开始更新用户质押数据...');
    const stakes = await getUserStakesWithCache(forceUpdate, t);
    const showStakes = [];
    for (let index = 0; index < stakes.length; index++) {
      let item = {...stakes[index]};
      item['stakingAmount'] = Number(item['stakingAmount']);
      item['stakingReward'] = Number(item['stakingReward']);
      let findIndex = showStakes.findIndex(it => it.poolNumber === item.poolNumber);
      let thisItem = null;
      if (findIndex !== -1) {
        thisItem = showStakes[findIndex];
        thisItem['stakingAmount'] += item['stakingAmount'];
        thisItem['stakingReward'] += item['stakingReward'];
        continue;
      }
      showStakes.push(item);
    }
    console.log(showStakes);
    myStakingList.value = showStakes;
    console.log('用户质押数据更新完成:', stakes);
  } catch (error) {
    console.error('更新用户质押数据失败:', error);
    myStakingList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 更新质押池数据
const updatePoolsInfo = async (forceUpdate: boolean = false) => {
  if (!forceUpdate && isLoadingPools.value) {
    return; // 防止重复请求
  }

  try {
    isLoadingPools.value = true;
    console.log('开始更新质押池数据...');
    const pools = await getAllPoolsInfoWithCache(forceUpdate, t);
    stakingContracts.value = pools;
    console.log('质押池数据更新完成:', pools);
  } catch (error) {
    console.error('更新质押池数据失败:', error);
    stakingContracts.value = [];
  } finally {
    isLoadingPools.value = false;
  }
};

// 更新质押收益数据
const updateStakingDividends = async (forceUpdate: boolean = false) => {
  if (!walletStore.address || myStakingList.value.length === 0) {
    return;
  }

  try {
    console.log('开始更新质押收益数据...');

    const stakes = await getUserStakesWithCache(forceUpdate, t);

    // 获取所有质押记录的stakeId
    const stakeIds = stakes.map(stake => stake.stakeId);

    // 批量获取收益数据
    const dividendsMap = await getBatchStakeDividendsWithCache(stakeIds, forceUpdate);
    console.log(dividendsMap, '更新质押收益');
    const showStakes = [];
    for (let index = 0; index < stakes.length; index++) {
      let item = {...stakes[index]};
      item['stakingAmount'] = Number(item['stakingAmount']);
      item['stakingReward'] = Number(dividendsMap.get(item.stakeId));
      let findIndex = showStakes.findIndex(it => it.poolNumber === item.poolNumber);
      let thisItem = null;
      if (findIndex !== -1) {
        thisItem = showStakes[findIndex];
        thisItem['stakingAmount'] += item['stakingAmount'];
        thisItem['stakingReward'] += item['stakingReward'];
        continue;
      }
      showStakes.push(item);
    }
    console.log(showStakes);
    myStakingList.value = showStakes;
    // // 更新质押列表中的收益数据
    // myStakingList.value.forEach(stake => {
    //   let poolNumber = stake.poolNumber;
    //   const newDividends = dividendsMap.get(stake.stakeId)
    //   if (newDividends !== undefined) {
    //     stake.stakingReward = newDividends
    //   }
    // })

    console.log('质押收益数据更新完成');
  } catch (error) {
    console.error('更新质押收益数据失败:', error);
  }
};

// 启动定时器更新质押数据
const startStakingTimer = () => {
  if (stakingTimer) return;
  updateUserStakes(true); // 立即执行一次
  stakingTimer = window.setInterval(() => {
    updateUserStakes(); // 每30秒更新一次
  }, 30000);
};

// 启动定时器更新质押池数据
const startPoolsTimer = () => {
  if (poolsTimer) return;
  updatePoolsInfo(true); // 立即执行一次
  poolsTimer = window.setInterval(() => {
    updatePoolsInfo(); // 每5分钟更新一次（质押池信息变化较少）
  }, 5 * 60 * 1000);
};

// 启动定时器更新收益数据
const startDividendsTimer = () => {
  if (dividendsTimer) return;
  updateStakingDividends(true); // 立即执行一次
  dividendsTimer = window.setInterval(() => {
    updateStakingDividends(); // 每30秒更新一次收益
  }, 10000);
};

// 停止定时器
const stopStakingTimer = () => {
  if (stakingTimer) {
    clearInterval(stakingTimer);
    stakingTimer = null;
  }
};

const stopPoolsTimer = () => {
  if (poolsTimer) {
    clearInterval(poolsTimer);
    poolsTimer = null;
  }
};

const stopDividendsTimer = () => {
  if (dividendsTimer) {
    clearInterval(dividendsTimer);
    dividendsTimer = null;
  }
};

onMounted(() => {
  console.log(1);
  startStakingTimer();
  startPoolsTimer();
  startDividendsTimer();
});

onUnmounted(() => {
  stopStakingTimer();
  stopPoolsTimer();
  stopDividendsTimer();
});

// 处理我的质押池点击
const handleMyStakingPool = (stakingId?: number) => {
  if (stakingId) {
    // 如果传入了质押ID，跳转到详情页
    router.push(`/staking-detail/${stakingId}?type=my-staking`);
  } else {
    // 点击"我的质押池(NFT)"按钮，跳转到NFT质押页面
    console.log('跳转到NFT质押页面');
    router.push('/nft-staking');
  }
};

// 处理NFT质押池按钮点击
const handleNFTStakingPool = () => {
  console.log('点击我的质押池(NFT)按钮，跳转到NFT质押页面', router);
  router.push('/nft-staking');
};

// 处理质押合约按钮点击
const handleStakingContract = (contract: any) => {
  router.push(`/staking-detail/${contract.id}?type=${contract.poolType}`);
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
          <AlphaLogo/>
          <LanguageSwitcher/>
        </div>
      </header>

      <!-- Main Content -->
      <div class="px-4 py-6">
        <!-- 标题 -->
        <h1 class="text-3xl font-bold mb-6" style="color: #B8860B">{{ t('staking.title') }}</h1>

        <!-- 我的质押池按钮 - 使用签到领取按钮样式 -->
        <button
            @click="handleNFTStakingPool"
            class="w-full mb-6 py-4 text-xl font-bold tracking-wider uppercase
         bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600
         text-yellow-900
         border-2 border-yellow-700
         rounded-lg
         shadow-[0_0_15px_rgba(251,191,36,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
         transform transition-all duration-300
         hover:shadow-[0_0_25px_rgba(251,191,36,0.6),inset_0_1px_0_rgba(255,255,255,0.5)]
         hover:scale-[1.02] active:scale-[0.98]
         focus:outline-none focus:ring-4 focus:ring-yellow-300/50"
        >
          {{ t('staking.my_staking_pool_nft') }}
        </button>

        <!-- 绿色背景容器 -->
        <div class="rounded-2xl p-4 mb-6"
             style="background: linear-gradient(135deg,rgba(228, 205, 156, 0.5) 0%,rgba(213, 188, 141, 0.5) 100%);">

          <!-- 我的质押列表 -->
          <!-- 最外层淡金背景 -->
          <div class="mb-6
            bg-gradient-to-b from-[#FFFDF7] to-[#F5EEDF]
            rounded-2xl p-6">

            <!-- 标题 -->
            <h2 class="text-xl font-bold text-[#7D5E24] mb-5">
              {{ t('staking.my_staking') }}
            </h2>

            <!-- 1. 加载 -->
            <div v-if="isLoading"
                 class="flex items-center space-x-3">
              <svg class="animate-spin h-5 w-5 text-[#B8955E]"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span class="text-sm text-[#7D5E24] font-medium">
      {{ t('common.loading') }}
    </span>
            </div>

            <!-- 2. 未连接钱包 -->
            <div v-else-if="!walletStore.address"
                 class="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg"
                   class="h-6 w-6 text-[#B8955E] flex-shrink-0 mt-0.5"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <div>
                <h3 class="font-medium text-[#7D5E24]">
                  {{ t('staking.connect_wallet_to_view') }}
                </h3>
                <p class="text-sm text-[#7D5E24]/80 mt-1">
                  {{ t('staking.connect_wallet_to_view_desc') }}
                </p>
              </div>
            </div>

            <!-- 3. 暂无质押记录 -->
            <div v-else-if="myStakingList.length === 0"
                 class="flex items-start space-x-3">
              <img src="https://wufeng98.cn/imgServerApi/images/6f4c3eff-a594-49a5-82a2-be9e4a808452.png"
                   class="w-6 h-6 opacity-60 flex-shrink-0 mt-0.5"
                   alt="质押">
              <div>
                <h3 class="font-medium text-[#7D5E24]">
                  {{ t('staking.no_staking_records') }}
                </h3>
                <p class="text-sm text-[#7D5E24]/80 mt-1">
                  {{ t('staking.no_staking_records_desc') }}
                </p>
              </div>
            </div>

            <!-- 4. 质押列表 -->
            <div v-else class="space-y-4">
              <div v-for="staking in myStakingList"
                   :key="staking.id"
                   @click="handleMyStakingPool(staking.poolNumber)"
                   class="bg-white/60 backdrop-blur-sm
                border border-[#D4BE8D]/60
                rounded-2xl p-5">

                <!-- 头部：池编号 + 状态 -->
                <div class="flex items-center justify-between mb-4">
                  <!-- 左侧：图标 + 标题 -->
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         :class="`bg-gradient-to-br ${staking.poolGradient}`">
                      <svg xmlns="http://www.w3.org/2000/svg"
                           class="h-5 w-5 text-white"
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-bold text-[#7D5E24]">
                        {{ t(`staking.${staking.poolType}_pool`) }} {{ staking.poolNumber }}
                      </h3>
                      <p class="text-xs text-[#7D5E24]/70">
                        {{ t('staking.pool') }} {{ staking.poolNumber }}
                      </p>
                    </div>
                  </div>

                  <!-- 状态标签 -->
                  <div class="px-3 py-1 text-xs font-medium rounded-full text-white"
                       :class="`bg-gradient-to-r ${staking.poolGradient}`">
                    {{ staking.status }}
                  </div>
                </div>

                <!-- 主要质押金额 -->
                <!-- 渐变金框卡片 -->
                <div class="mb-4 rounded-xl p-4 bg-gradient-to-br from-[#FFF9E6] via-[#F5E7C7] to-[#E8D8B7] shadow-lg">
                  <!-- 顶部标题 -->
                  <div class="text-sm font-medium text-[#7D5E24]/80 mb-2">
                    {{ t('staking.fund_pool') }}
                  </div>

                  <!-- 金额区域 -->
                  <div class="flex items-baseline">
                    <!-- 大数字：渐变金 + 阴影 -->
                    <span
                        class="text-2xl font-black bg-gradient-to-r from-[#B8955E] via-[#D4BE8D] to-[#E8C874] bg-clip-text text-[#D2691E] drop-shadow-sm"
                    >
      {{ formatNumber(staking.stakingAmount) }}
    </span>

                    <!-- 单位：淡金标签 -->
                    <span
                        class="ml-3 px-2 py-0.5 text-xs font-semibold text-[#7D5E24] bg-white/70 rounded-full shadow-sm"
                    >
      RWA
    </span>
                  </div>

                  <!-- 底部金色装饰线 -->
                  <div class="mt-2 h-0.5 rounded-full bg-gradient-to-r from-[#D4BE8D] via-[#C7A76A] to-transparent opacity-70"></div>
                </div>

                <!-- 网格信息 -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-[#F5E7C7]/80 rounded-lg p-3">
                    <p class="text-xs text-[#7D5E24]/60 mb-1">
                      {{ t('staking.annual_rate') }}
                    </p>
                    <p class="font-bold text-[#B8955E]">
                      {{ staking.yearRate }}
                    </p>
                  </div>
                  <div class="bg-[#F5E7C7]/80 rounded-lg p-3">
                    <p class="text-xs text-[#7D5E24]/60 mb-1">
                      {{ t('staking.staking_reward') }}
                    </p>
                    <p class="font-bold text-[#7D5E24]">
                      {{ formatNumber(staking.stakingReward) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 质押合约列表 -->
          <!-- 最外层淡金背景 -->
          <div id="staking-contracts"
               class="mb-6
            bg-gradient-to-b from-[#FFFDF7] to-[#F5EEDF]
            rounded-2xl p-6">

            <!-- 标题 -->
            <h2 class="text-xl font-bold text-[#7D5E24] mb-5">
              {{ t('staking.staking_contracts') }}
            </h2>

            <!-- 1. 加载 -->
            <div v-if="isLoadingPools"
                 class="flex items-center space-x-3">
              <svg class="animate-spin h-5 w-5 text-[#B8955E]"
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span class="text-sm text-[#7D5E24] font-medium">
      {{ t('common.loading') }}
    </span>
            </div>

            <!-- 2. 暂无池子 -->
            <div v-else-if="stakingContracts.length === 0"
                 class="flex items-start space-x-3">
              <img src="https://wufeng98.cn/imgServerApi/images/6f4c3eff-a594-49a5-82a2-be9e4a808452.png"
                   class="w-6 h-6 opacity-60 flex-shrink-0 mt-0.5"
                   alt="质押">
              <div>
                <h3 class="font-medium text-[#7D5E24]">
                  {{ t('staking.no_available_pools') }}
                </h3>
                <p class="text-sm text-[#7D5E24]/80 mt-1">
                  {{ t('staking.no_available_pools_desc') }}
                </p>
              </div>
            </div>

            <!-- 3. 合约列表 -->
            <div v-else class="space-y-4">
              <div v-for="contract in stakingContracts"
                   :key="contract.id"
                   @click="handleStakingContract(contract)"
                   class="bg-white/60 backdrop-blur-sm
                border border-[#D4BE8D]/60
                rounded-2xl p-5">

                <!-- 头部：图标 + 池名 + 状态 -->
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         :class="`bg-gradient-to-br ${contract.poolGradient}`">
                      <svg xmlns="http://www.w3.org/2000/svg"
                           class="h-5 w-5 text-white"
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              stroke-width="2"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-bold text-[#7D5E24]">
                        {{ t(`staking.${contract.poolType}_pool`) }}
                      </h3>
                      <p class="text-xs text-[#7D5E24]/70">
                        {{ contract.contractId }}
                      </p>
                    </div>
                  </div>

                  <div class="px-3 py-1 text-xs font-medium rounded-full text-white"
                       :class="`bg-gradient-to-r ${contract.poolGradient}`">
                    {{ contract.status }}
                  </div>
                </div>

                <!-- 总金额 -->
                <!-- 金辉夺目卡片 -->
                <div class="mb-5 rounded-xl p-4
            bg-gradient-to-br from-[#FFF9E6] via-[#F5E7C7] to-[#E8D8B7]
            shadow-[0_4px_20px_rgba(212,190,141,0.45)]
            border border-[#D4BE8D]/60">

                  <!-- 标签 -->
                  <p class="text-sm font-semibold text-[#7D5E24]/90 mb-2">
                    {{ t('staking.total_amount') }}
                  </p>

                  <!-- 金额区域 -->
                  <div class="flex items-end space-x-2">
                    <!-- 大数字：多层金色渐变 + 高亮阴影 -->
                    <span
                        class="text-3xl font-black
             bg-gradient-to-r from-[#F7E9C7] via-[#D4BE8D] to-[#B8955E]
             bg-clip-text text-[#D2691E]
             drop-shadow-[0_2px_4px_rgba(212,190,141,0.7)]"
                    >
      {{ formatNumber(contract.totalAmount) }}
    </span>

                    <!-- 单位：金色徽章 -->
                    <span
                        class="px-2.5 py-1 text-xs font-bold text-[#7D5E24]
             bg-gradient-to-br from-[#FFF9E6] to-[#F5E7C7]
             rounded-full shadow-sm border border-[#D4BE8D]/40"
                    >
      RWA
    </span>
                  </div>

                  <!-- 底部高亮渐变线 -->
                  <div class="mt-3 h-1 rounded-full
              bg-gradient-to-r from-transparent via-[#D4BE8D] to-transparent
              opacity-80"></div>
                </div>

                <!-- 网格信息 -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div class="bg-[#F5E7C7]/80 rounded-lg p-3">
                    <p class="text-xs text-[#7D5E24]/60 mb-1">
                      {{ t('staking.staking_time') }}
                    </p>
                    <p class="font-bold text-[#7D5E24]">
                      {{ contract.lockupPeriod }}
                    </p>
                  </div>
                  <div class="bg-[#F5E7C7]/80 rounded-lg p-3">
                    <p class="text-xs text-[#7D5E24]/60 mb-1">
                      {{ t('staking.annual_rate') }}
                    </p>
                    <p class="font-bold text-[#B8955E]">
                      {{ contract.yearRate }}
                    </p>
                  </div>
                </div>

                <!-- 按钮 -->
                <button @click.stop="handleStakingContract(contract)"
                        class="w-full py-3 text-black font-bold rounded-full
                     bg-gradient-to-r from-[#D4BE8D] to-[#C7A76A]
                     hover:scale-105 transition-transform">
                  {{ t('staking.add_staking') }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
