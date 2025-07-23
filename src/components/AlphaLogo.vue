<script setup lang="ts">
defineProps({
  size: {
    type: String,
    default: 'md'
  }
})
</script>

<template>
  <div :class="[
    'inline-flex items-center',
    size === 'sm' ? 'gap-1' : 'gap-2',
    'cursor-pointer'
  ]">
    <img
      :src="'https://wufeng98.cn/imgServerApi/images/084ea8d1-3406-4ce0-8cca-c7c5e02de238.png'"
      :alt="'RWA Logo'"
      :class="[
        'object-contain',
        size === 'sm' ? 'h-6' : size === 'md' ? 'h-8' : 'h-10'
      ]"
    />
  </div>
</template>
