import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
import MainPage from "@/components/MainPage.vue";

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/main', component: MainPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;