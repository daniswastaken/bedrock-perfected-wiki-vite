import { watch } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import AutoRedirect from './AutoRedirect.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('AutoRedirect', AutoRedirect)

    if (typeof window !== 'undefined') {
      const applyTrim = () => {
        document.querySelectorAll('img').forEach((img: any) => {
          if (img.alt && img.alt.includes('#trim-left')) {
            img.classList.add('trim-left');
            img.alt = img.alt.replace('#trim-left', '').trim();
          }
        });
      };

      watch(() => router.route.path, () => {
        setTimeout(applyTrim, 100);
        setTimeout(applyTrim, 500);
      }, { immediate: true });

      const observer = new MutationObserver(applyTrim);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }
} satisfies Theme