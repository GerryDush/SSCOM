import {createApp} from 'vue'
import App from './App.vue'
import VueResizeObserver from "vue-resize-observer";

createApp({
    directives: {'resize': VueResizeObserver},
})
createApp(App).mount('#app')
