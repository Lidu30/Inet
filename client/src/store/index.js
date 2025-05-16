import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    loggedIn: false,
    username: "",
    timeSlots: [],
    selectedTime: "",
    selectedTimeslotId: null,
    admin: "",
    reservedSlots: new Set(),
  },
  getters: {
    isAuthenticated(state) {
      return state.authenticated;
    },
    isLoggedIn(state) {
      return state.loggedIn;
    },

    availableTimeSlots(state) {
      return state.timeSlots.filter(
        (slot) => !slot.booked && !state.reservedSlots.has(slot.timeslot_id)
      );
    },

    bookedTimeSlots(state) {
      return state.timeSlots.filter((slot) => slot.booked);
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

    setSelectedTime(state, { time, id, admin }) {
      state.selectedTime = time;
      state.selectedTimeId = id;
      state.admin = admin;
    },

    setSelectedTimeslotId(state, id) {
      state.selectedTimeslotId = id;
    },

    setAdmin(state, admin) {
      state.admin = admin;
    },
    addTimeslot(state, timeslot) {
      state.timeSlots.push(timeslot);
    },

    removeTimeslot(state, timeslotId) {
      state.timeSlots = state.timeSlots.filter(
        (slot) => String (slot.id) !== String (timeslotId)      );
    },

    updateTimeslot(state, updatedTimeslot) {
      const index = state.timeSlots.findIndex(
        (slot) => slot.timeslot_id === updatedTimeslot.timeslot_id
      );
      if (index !== -1) {
        state.timeSlots.splice(index, 1, updatedTimeslot);
      }
    },

    reserveTimeslot(state, timeslotId) {
      state.reservedSlots.add(timeslotId);
    },

    unreserveTimeslot(state, timeslotId) {
      state.reservedSlots.delete(timeslotId);
    },
  },

  actions: {
    login({ commit }, { username, password }) {
      // This is a simplified version for testing
      if (password === "valid1" || password === "test1") {
        commit("setLoggedIn", true);
        commit("setUsername", username);
        commit("setAuthenticated", true);
        return true;
      }
      return false;
    },
    logout({ commit }) {
      fetch("/api/logout", { method: "POST" })
        .then(() => {
          commit("setLoggedIn", false);
          commit("setUsername", "");
          commit("setAuthenticated", false);
        })
        .catch((error) => console.error("Logout error:", error));
    },
    // Other actions are implemented in the components directly
  },

  modules: {},
});
