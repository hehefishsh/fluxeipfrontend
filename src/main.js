import "bootstrap/dist/js/bootstrap.bundle.min.js";
import 'jquery/dist/jquery.min.js'
import 'element-plus/dist/index.css';

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router.js";
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus';


const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App)
    .use(router)
    .use(pinia)
    .use(ElementPlus)
    .mount("#app");
