<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <button
      class="navbar-toggler mx-2 mb-2"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div id="navbarNav" class="collapse navbar-collapse mx-2">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/login')">Login</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/showTimeslots')"
            >Available times</a>
        </li>

        <li v-if="isLoggedIn" class="nav-item">
          <a class="nav-link" href="#" @click="redirect('/admin')">Admin</a>
        </li>
        <li v-if="isLoggedIn" class="nav-item">
          <a class="nav-link" href="#" @click="logout">Logout</a>
        </li>
      </ul>
    </div>
  </nav>
  <section class="container-fluid py-4">
    <router-view />
  </section>
</template>

<script>
// @ is an alias to /src
import "bootstrap";
import io from "socket.io-client";
export default {
  name: "App",
  components: {},
  data: () => ({
    socket:null
  }),

  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },

  created() {
    const { commit } = this.$store;

     // Check authentication status
    fetch("/api/auth/status")
      .then(res => res.json())
      .then(({ authenticated, username }) => {
        commit("setLoggedIn", authenticated);
        commit("setUsername", username || "");
        commit("setAuthenticated", authenticated);

        if (authenticated) {
        this.$router.push('/admin');
      } else {
        this.$router.push('/login');
      }

      })
      .catch(console.error);
  },

  mounted() {
    // Initialize socket connection
    this.socket = io();
    
    // Make socket available to child components
    this.$root.socket = this.socket;
    
    // Setup global socket event listeners
    this.socket.on('timeslot:created', (data) => {
      this.$store.commit('addTimeslot', data);
    });
    
    this.socket.on('timeslot:deleted', (data) => {
      this.$store.commit('removeTimeslot', data.id);
    });
    
    this.socket.on('timeslot:reserved', (data) => {
      this.$store.commit('reserveTimeslot', data.id);
    });
    
    this.socket.on('timeslot:released', (data) => {
      this.$store.commit('unreserveTimeslot', data.id);
    });
    
    this.socket.on('timeslot:booked', (data) => {
      this.$store.commit('updateTimeslot', data);
    });
  },
  methods: {
    redirect(target) {
      this.$router.push(target);
    },

    logout() {
      fetch("/api/logout", { 
        method: "POST",
        credentials: 'include'
      })
      .then(() => {
        this.$store.commit("setLoggedIn", false);
        this.$store.commit("setUsername", "");
        this.$store.commit("setAuthenticated", false);
        this.$router.push("/login");
      })
      .catch(console.error);
    }
  },
};
</script>

<style>
@import url("bootstrap/dist/css/bootstrap.css");

html,
body {
  /* https://designs.ai/colors */
  background-color: #a7d7c5;
}
</style>
