import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import piniaPersist from 'pinia-plugin-persistedstate'

// 导入所有主题CSS以确保它们被包含在构建中
import './themes/light.css'
import './themes/dark.css'
import './themes/sepia.css'
import './themes/blue.css'
import './themes/chinese-red.css'
import './themes/chinese-teal.css'
import './themes/chinese-ink.css'
import './themes/chinese-moon.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersist)

// 初始化默认主题
document.documentElement.setAttribute('data-theme', 'light')
document.body.setAttribute('data-theme', 'light')

app.use(pinia)
app.mount('#app')
