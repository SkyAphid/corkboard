import './main.css'
import { createApp } from 'vue'
import App from './App.vue'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import './css/vue3-context-menu.css'
import { ContextMenu } from '@imengyu/vue3-context-menu'

const app = createApp(App);

app.component('QuillEditor', QuillEditor)
app.component('ContextMenu', ContextMenu)

app.mount('#app')
