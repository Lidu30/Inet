import { createStore } from "vuex";

export default createStore({
  state: {
    loggedIn: false,
    authenticated: false,
    username: "",
    timeSlots: ["15:00", "15:15", "15:30", "15:45"],
    selectedTime: "",
    admin: "",
  },
  getters: {
    isAuthenticated(state) {
      return state.authenticated;
    },
    isLoggedIn(state) {
      return state.loggedIn;
    },
  },
  mutations: {
    setAuthenticated(state, authenticated) {
      state.authenticated = authenticated;
    },
    setLoggedIn(state, status) {
      state.loggedIn = status;
    },

    setUsername(state, username) {
      state.username = username;
    },

    setTimeSlots(state, timeSlots) {
      state.timeSlots = timeSlots;
    },

    setSelectedTime(state, selectedTime) {
      state.selectedTime = selectedTime;
    },

    setAdmin(state, admin) {
      state.admin = admin;
    },
  },

  actions: {
    login({ commit }, { username, password }) {
      if (password === "valid1") {
        commit("setLoggedIn", true);
        commit("setUsername", username);
        commit("setAuthenticated", true);
        return true;
      }
      return false;
    },

    adminTimes({ commit }, { timeSlots }) {
      commit("setTimeSlots", timeSlots);
    },

    selectedTime({ commit }, { selectedTime }) {
      commit("setSelectedTime", selectedTime);
    },

    admin({ commit }, { adminName }) {
      commit("setAdmin", adminName);
    },
  },
  modules: {},
});
