import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import AutoRedirect from './AutoRedirect.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AutoRedirect', AutoRedirect)
  }
} satisfies Theme