import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import Rooms from "../views/Rooms.vue";
import Room from "../views/Room.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/",
    redirect: "/rooms",
  },
  {
    path: "/rooms",
    component: Rooms,
  },
  {
    path: "/rooms/:name",
    component: Room,
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  if (store.state.authenticated || to.path === "/login") {
    next();
  } else {
    console.info("Unauthenticated user. Redirecting to login page.");
    next("/login");
  }
});

export default router;
