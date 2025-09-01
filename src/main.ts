import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import '@/auth'

// highlight.js Vue 插件
import 'highlight.js/styles/stackoverflow-dark.css'
import 'highlight.js/lib/common'
import hljsVuePlugin from "@highlightjs/vue-plugin"

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.use(hljsVuePlugin)
app.mount('#app')