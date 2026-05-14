<script setup>
import { useData, useRouter } from 'vitepress'
import { onMounted } from 'vue'

const { theme, page } = useData()
const router = useRouter()

onMounted(() => {
  const sidebar = theme.value.sidebar
  if (!sidebar) return

  const currentPath = page.value.relativePath
  const sectionDir = currentPath.split('/')[0]

  const section = sidebar.find(s => 
    s.items && s.items.some(item => item.link.startsWith(`/${sectionDir}/`))
  )

  if (section && section.items && section.items.length > 0) {
    const firstItem = section.items[0]
    router.go(firstItem.link)
  }
})
</script>

<template>
  <div class="redirect-container">
    <div class="loader"></div>
    <p>Redirecting to section home...</p>
  </div>
</template>

<style scoped>
.redirect-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--vp-c-text-2);
  font-family: var(--vp-font-family-base);
}

.loader {
  border: 2px solid var(--vp-c-divider);
  border-top: 2px solid var(--vp-c-brand-1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
