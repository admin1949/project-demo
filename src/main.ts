import { createApp } from "vue";
import "./style/index.scss";
import "./style/antv-xmind.scss";
import App from "./App.vue";
import { router } from "@/router";

createApp(App).use(router).mount("#app");
