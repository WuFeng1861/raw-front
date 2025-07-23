<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const currentRoute = computed(() => route.path)

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 w-full bg-alpha-secondary border-t border-gray-800 px-4 py-2 z-50">
    <div class="flex justify-around items-center">
      <button
        @click="navigateTo('/')"
        class="flex flex-col items-center py-1 transition-all duration-300"
        :class="currentRoute === '/' ? 'text-alpha-primary' : 'text-gray-400 hover:text-gray-200'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l9 7v11a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6H9v6a1 1 0 01-1 1H4a1 1 0 01-1-1V10l9-7z" />
        </svg>
        <span class="text-xs mt-1">{{ t('nav.home') }}</span>
      </button>

      <button
        @click="navigateTo('/friends')"
        class="flex flex-col items-center py-1 transition-all duration-300"
        :class="currentRoute === '/friends' ? 'text-alpha-primary' : 'text-gray-400 hover:text-gray-200'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a1 1 0 001-1v-3a3 3 0 00-6 0v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a3 3 0 00-6 0v3a1 1 0 001 1zm5-8a4 4 0 11-8 0 4 4 0 018 0zm8-4a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-xs mt-1">{{ t('nav.friends') }}</span>
      </button>

      <button
        @click="navigateTo('/box')"
        class="flex flex-col items-center py-1 transition-all duration-300"
        :class="currentRoute === '/box' ? 'text-alpha-primary' : 'text-gray-400 hover:text-gray-200'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span class="text-xs mt-1">{{ t('nav.box') }}</span>
      </button>
      <button
        @click="navigateTo('/staking')"
        class="flex flex-col items-center py-1 transition-all duration-300"
        :class="currentRoute === '/staking' ? 'text-alpha-primary' : 'text-gray-400 hover:text-gray-200'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs mt-1">{{ t('nav.staking') }}</span>
      </button>

      <button
        @click="navigateTo('/node')"
        class="flex flex-col items-center py-1 transition-all duration-300"
        :class="currentRoute === '/node' ? 'text-alpha-primary' : 'text-gray-400 hover:text-gray-200'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        <span class="text-xs mt-1">{{ t('nav.node') }}</span>
      </button>
    </div>
  </nav>
</template>
