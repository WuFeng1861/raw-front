<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useWalletStore } from '../stores/wallet'
import { connectWallet, checkUpline } from '../utils/useEthWallet'
import { ref } from 'vue'

const { t } = useI18n()
const walletStore = useWalletStore()
const showInviterModal = ref(false)

const emit = defineEmits(['showInviterModal'])

// 连接钱包
const handleConnectWallet = async () => {
  const result = await connectWallet()
  if (result.status && result.data?.address) {
    console.log(`连接钱包`);
    walletStore.setAddress(result.data.address)

    // 检查是否绑定邀请人
    const upline = await checkUpline(result.data.address)
    const hasUpline = upline && upline !== '0x0000000000000000000000000000000000000000'
    walletStore.setUplineStatus(hasUpline)
    if (!hasUpline) {
      emit('showInviterModal')
    }
  }
}
</script>

<template>
  <button 
    @click="handleConnectWallet"
    :class="[
      'flex items-center justify-center gap-2 px-6 py-2 pr-8 font-bold transition-all duration-300 rounded-full shadow-lg',
      'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600',
      'hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500',
      'hover:shadow-xl hover:scale-105 active:scale-95',
      'text-white border border-blue-400/30',
      'hover:border-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50',
      $i18n.locale === 'en' ? 'text-sm' : 'text-base'
    ]"
    style="box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3), 0 0 30px rgba(147, 51, 234, 0.2)"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span class="tracking-[0.15em] text-blue-50 font-semibold">
      {{ walletStore.address ? walletStore.formattedAddress : t('home.connect_wallet') }}
    </span>
  </button>
</template>