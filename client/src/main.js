
import { createApp } from "vue";
import store from "./store";
import router from "./router";
import App from "./App.vue";

const app = createApp(App).use(store).use(router).mount("#app");
window.onload = () => {
    // The socket.io client is served by the server and available as 'io'
    if (window.io) {
      const socket = window.io();
      
      // Store the socket on the root component for components to access
      app.$root.io = socket;
      
      // Set up listeners for socket events to update the store
      socket.on('timeslot:created', (data) => {
        store.commit('addTimeslot', data);
      });
      
      socket.on('timeslot:deleted', (data) => {
        store.commit('removeTimeslot', data.id);
      });
      
      socket.on('timeslot:reserved', (data) => {
        store.commit('reserveTimeslot', data.id);
      });
      
      socket.on('timeslot:released', (data) => {
        store.commit('unreserveTimeslot', data.id);
      });
      
      socket.on('timeslot:booked', (data) => {
        store.commit('updateTimeslot', data);
        store.commit('unreserveTimeslot', data.id);
      });
    }
};