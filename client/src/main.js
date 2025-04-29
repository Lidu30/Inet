import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { io } from "socket.io-client";

const app = createApp(App).use(store).use(router).mount("#app");
// Create a Socket.IO connection
const socket = io();

// Make socket.io available throughout the app
app.config.globalProperties.$socket = socket;

// Also make it available on the root element for components to access
app.provide('socket', socket);

// Add the socket instance to the root component
app.socketInstance = { io: socket };