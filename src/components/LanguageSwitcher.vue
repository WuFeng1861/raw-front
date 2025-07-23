<script setup lang="ts">
import { useLocaleStore } from '../stores/locale'
import { useI18n } from 'vue-i18n'

const localeStore = useLocaleStore()
const { t } = useI18n()

const toggleLanguage = () => {
  localeStore.toggleLocale()
}
</script>

<template>
  <button 
    @click="toggleLanguage" 
    class="inline-flex items-center justify-center px-4 py-2 border border-purple-400/40 rounded-full text-sm font-medium text-purple-200 hover:text-white bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-500/50 hover:to-indigo-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
  >
    <span v-if="localeStore.currentLocale === 'en'" class="tracking-wide">中文</span>
    <span v-else class="tracking-wide">English</span>
  </button>
</template>