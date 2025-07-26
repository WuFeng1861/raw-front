<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {ref, onMounted} from 'vue';
import AlphaLogo from '../components/AlphaLogo.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import NodeExchangeModal from '../components/NodeExchangeModal.vue';
import config from '../assets/config';
import {useRouter} from 'vue-router';
import toast from '../utils/toast';
import {buyNode, getNodeMessage} from '../utils/useStaking';

const {t} = useI18n();
const router = useRouter();

// 控制兑换弹窗显示
const showExchangeModal = ref(false);
const selectedNode = ref(null);

// 节点数据
const nodeList = ref([
  {
    id: 1,
    type: 'gold_node',
    points: 20,
    totalPoints: 20,
    pointsNow: 0,
    progress: 0.5, // 进度百分比
    tokens: 2000,
    uTokens: 2000,
    members: 2000,
    color: '#FFD700', // 金色
    bgGradient: '',
    buttonText: 'click_exchange',
    buttonDisabled: false
  },
  {
    id: 2,
    type: 'silver_node',
    points: 300,
    totalPoints: 300,
    pointsNow: 0,
    progress: 0, // 进度百分比
    tokens: 500,
    uTokens: 500,
    members: 500,
    color: '#C0C0C0', // 银色
    bgGradient: '',
    buttonText: 'click_exchange',
    buttonDisabled: false
  },
  {
    id: 3,
    type: 'bronze_node',
    points: 1000,
    totalPoints: 1000,
    pointsNow: 0,
    progress: 0, // 进度百分比
    tokens: 100,
    uTokens: 100,
    members: 100,
    color: '#CD7F32', // 铜色
    bgGradient: '',
    buttonText: 'click_exchange',
    buttonDisabled: false
  }
].reverse());

// 处理兑换按钮点击
const handleExchange = (node: any) => {
  selectedNode.value = node;
  showExchangeModal.value = true;
};

// 关闭兑换弹窗
const closeExchangeModal = () => {
  showExchangeModal.value = false;
  selectedNode.value = null;
};

// 确认兑换
const confirmExchange = async (type: string, amount: string) => {
  // 验证兑换数量
  if (!amount || parseFloat(amount) <= 0) {
    return;
  }
  if (!selectedNode.value) {
    return;
  }
  console.log('兑换确认:', {
    node: t(`node.${selectedNode.value?.type}`),
    type,
    amount
  });

  // 这里可以添加实际的购买逻辑
  // 比如调用合约方法、更新用户余额等
  let result = await buyNode(selectedNode.value?.id, type as "token" | "u", amount, t);

  if (result.status) {
    // 显示成功提示
    const exchangeTypeName = type === 'token' ? t('node.alpha_tokens') : t('node.u_tokens');
    const nodeTypeName = t(`node.${selectedNode.value?.type}`);
    toast.success(t('node.purchase_success', {amount, tokenType: exchangeTypeName, nodeType: nodeTypeName}));
  } else {
    toast.error(result.message);
  }

  // 关闭弹窗
  closeExchangeModal();
};

// 处理节点卡片点击
const handleNodeClick = (node: any) => {

};

onMounted(async () => {
  let dataTemp = await getNodeMessage(t);
  nodeList.value = dataTemp.data;
  console.log('nodeList:', nodeList.value);
});
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

      <div class="px-4 py-6">
        <!-- 节点列表 -->
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
              v-for="node in nodeList"
              :key="node.id"
              @click="handleNodeClick(node)"
              class="relative rounded-2xl p-5 shadow-lg cursor-pointer
             border border-[#FFD97D]/40
             hover:shadow-[0_8px_24px_rgba(255,201,76,0.25)]
             hover:scale-[1.02]
             transition-all duration-300"
              :class="`bg-gradient-to-br ${node.bgGradient}`"
          >
            <!-- 节点图标 + 标题 + 份额（右对齐） -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-3">
                <!-- 图标 -->
                <div
                    class="w-10 h-10 rounded-full flex items-center justify-center
                   bg-gradient-to-br from-[#FFD97D] to-[#FFC94C]"
                >
                  <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-bold text-[#D8963F]">
                    {{ t(`node.${node.type}`) }}
                  </h3>
                  <p class="text-xs text-gray-600">节点 ID: {{ node.id }}</p>
                </div>
              </div>

              <!-- 份额 -->
              <div class="text-right">
                <p class="font-bold text-[#D8963F] text-lg">{{ node.points }} 份</p>
                <p class="text-xs text-gray-500">{{ node.pointsNow }}/{{ node.totalPoints }}</p>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="mb-3">
              <div class="w-full bg-[#FFD97D]/20 rounded-full h-2">
                <div
                    class="bg-gradient-to-r from-[#FFD97D] to-[#FFC94C] h-2 rounded-full"
                    :style="`width: ${node.progress}%`"
                ></div>
              </div>
            </div>

            <!-- 代币 & 成员信息 -->
            <div class="flex items-center justify-between mb-4 text-sm">
              <div class="flex items-center space-x-4">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full bg-[#FFD97D] mr-1.5"></div>
                  <span class="text-gray-700 font-medium"
                  >{{ node.tokens }}{{ t('node.million') }}</span
                  >
                </div>
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full bg-[#FFC94C] mr-1.5"></div>
                  <span class="text-gray-700 font-medium">{{ node.uTokens }} U</span>
                </div>
              </div>
              <div class="flex items-center text-gray-600">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{{ node.members }}</span>
              </div>
            </div>

            <!-- 兑换按钮 -->
            <button
                @click.stop="handleExchange(node)"
                :disabled="node.buttonDisabled"
                class="w-full py-2.5 font-bold rounded-full text-sm
               bg-gradient-to-r from-[#FFD97D] to-[#FFC94C]
               hover:shadow-lg
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-300"
            >
              {{ t(`node.${node.buttonText}`) }}
            </button>

            <!-- 装饰性金色光斑 -->
            <div
                class="absolute top-0 right-0 w-28 h-28 bg-[#FFD97D]/10 rounded-full blur-2xl -translate-y-14 translate-x-14"
            ></div>
            <div
                class="absolute bottom-0 left-0 w-20 h-20 bg-[#FFC94C]/10 rounded-full blur-xl translate-y-10 -translate-x-10"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换弹窗 -->
    <NodeExchangeModal
        :show="showExchangeModal"
        :node-data="selectedNode"
        @close="closeExchangeModal"
        @confirm="confirmExchange"
    />
  </div>
</template>

<style scoped>
/* 确保文本在深色背景上清晰可见 */
.text-white {
  color: #ffffff !important;
}
</style>
