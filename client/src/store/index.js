import { createStore } from "vuex";

export default createStore({
  state: {
    authenticated: false,
    loggedIn: false, 
    username: "",
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

    availableTimeSlots(state) {
      return state.timeSlots.filter(slot => !slot.booked && !state.reservedSlots.has(slot.timeslot_id));
    },

    bookedTimeSlots(state) {
      return state.timeSlots.filter(slot => slot.booked);
    },

  },
  mutations: {
    setAuthenticated(state, authenticated) {
      state.authenticated = authenticated;
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
    setAdmin(state, admin) {
      state.admin = admin;
    },
    addTimeslot(state, timeslot) {
      state.timeSlots.push(timeslot);
    },

    removeTimeslot(state, timeslotId) {
      state.timeSlots = state.timeSlots.filter(slot => slot.timeslot_id !== timeslotId);
    },

    updateTimeslot(state, updatedTimeslot) {
      const index = state.timeSlots.findIndex(slot => slot.timeslot_id === updatedTimeslot.timeslot_id);
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
    async authenticate({ commit }, { username, password }) {
      
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        commit('setLoggedIn', true);
        commit('setUsername', username);
        commit('setAuthenticated', true);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
      
    },
   

    async reserveTimeslot({ commit }, timeslotId) {
      const response = await fetch(`/api/timeslots/${timeslotId}/reserve`, {
        method: 'POST', })
      
      if (response.ok) {
        commit('reserveTimeslot', timeslotId);
        return { success: true };
      } 
      const error = response.json();
      return { success: false, error: error.error };
    },
    

    async bookTimeslot({ commit }, { timeslotId, studentName }) {
      
      const response = await fetch(`/api/timeslots/${timeslotId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName }),
      });
      
      if (response.ok) {
        const data = await response.json();
        commit('updateTimeslot', data.timeslot);
        commit('unreserveTimeslot', timeslotId);
        return { success: true };
      } 
      const error = await response.json();
      return { success: false, error: error.error };
    },
    

    async cancelReservation({ commit }, timeslotId) {
      const response = await fetch(`/api/timeslots/${timeslotId}/cancel`, {
        method: 'POST',
      });
    
      if (response.ok) {
        commit('unreserveTimeslot', timeslotId);
        return { success: true };
      } 
      const error = await response.json();
      return { success: false, error: error.error };
    },

    selectedTime({ commit }, { selectedTime }) {
      commit("setSelectedTime", selectedTime);
    },

    async addTimeslot({ commit }, time) {
      const response = await fetch('/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ time })
      });
      
      if (response.ok) {
        const data = await response.json();
        commit('addTimeslot', data);
        return { success: true };
      }
      const error = await response.json();
      return { success: false, error: error.error };
    },
    

    // Handle socket events
    handleSocketEvent({ commit }, { event, data }) {
      switch (event) {
        case 'new_timeslot':
          commit('addTimeslot', data);
          break;
        case 'delete_timeslot':
          commit('removeTimeslot', data.id);
          break;
        case 'reserve_timeslot':
          commit('reserveTimeslot', data.id);
          break;
        case 'unreserve_timeslot':
          commit('unreserveTimeslot', data.id);
          break;
        case 'book_timeslot':
          commit('updateTimeslot', data);
          commit('unreserveTimeslot', data.timeslot_id);
          break;
        default:
          console.warn('Unknown socket event:', event);
      }
    },
  },
  modules: {},
});
