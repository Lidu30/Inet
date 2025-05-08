import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
// import Rooms from "../views/Rooms.vue";
// import Room from "../views/Room.vue";
import Login from "../views/Login.vue";
import Admin from "../views/Admin.vue";
import Booking from "../views/Booking.vue";
import ShowTimeslots from "../views/ShowTimeslots.vue";

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/admin",
    component: Admin,
    meta: { requiresAuth: true },
  },
  {
    path: "/booking",
    component: Booking,
  },
  {
    path: "/showTimeslots",
    component: ShowTimeslots,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  /*
  if (store.state.authenticated || to.path === "/login") {
    next();
  } else {
    console.info("Unauthenticated user. Redirecting to login page.");
    next("/login");
  }
  */
  if (to.meta.requiresAuth) {
    if (!store.state.loggedIn) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
