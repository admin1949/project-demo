import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: {
      name: "XmindDemo",
    },
  },
  {
    path: "/map",
    name: "MapDemo",
    component: () => import("@/views/MapDemo/index.vue"),
  },
  {
    path: "/xmind",
    name: "XmindDemo",
    component: () => import("@/views/XmindDemo/index.vue"),
  },
  {
    path: "/test",
    name: "Test",
    component: () => import("@/views/Test/index.vue"),
  },
];

export const router = createRouter({
  routes,
  history: createWebHistory("/project-demos"),
});
