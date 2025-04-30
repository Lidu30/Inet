<template>
  <div>
    <div v-if="timeSlots.length === 0" class="no-slots">
      No time slots available.
    </div>

    <div
      v-for="(timeslot, index) in timeSlots"
      :key="index"
      class="timeslot-list"
    >
      <button type="button" @click="selectTime(timeslot)">
        {{ timeslot.time }} | {{ timeslot.assistantId }} | 
        <span v-if="timeslot.booked" class="status booked">BOOKED</span>
        <span v-else-if="isReserved(timeslot.id)" class="status reserved">RESERVED</span>
        <span v-else class="status available">AVAILABLE</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    timeSlots: [],
    reservedTimeslots: new Set()
  }),

  

  created() {
    this.loadTimeslots(); 
  },

  mounted() {
    // Setup socket listeners for real-time updates
    this.setupSocketListeners();
  },

  beforeUnmount() {
    // Clean up socket listeners
    this.cleanupSocketListeners();
  },
  
  methods: {
    loadTimeslots() {
      // Fetch timeslots from server
      fetch("/api/timeslots")
        .then(res => res.json())
        .then(data => {
          this.timeSlots = data.timeslots;
        })
        .catch(error => {
          console.error('Error loading timeslots:', error);
        });
    },

    setupSocketListeners() {
      // Get socket connection from root
      this.$socket = this.$root.io;
      
      if (this.$socket) {
        // Listen for timeslot events
        this.$socket.on('timeslot:created', this.handleTimeslotCreated);
        this.$socket.on('timeslot:deleted', this.handleTimeslotDeleted);
        this.$socket.on('timeslot:booked', this.handleTimeslotBooked);
        this.$socket.on('timeslot:reserved', this.handleTimeslotReserved);
        this.$socket.on('timeslot:released', this.handleTimeslotReleased);
      }
    },

    cleanupSocketListeners() {
      if (this.$socket) {
        this.$socket.off('timeslot:created');
        this.$socket.off('timeslot:deleted');
        this.$socket.off('timeslot:booked');
        this.$socket.off('timeslot:reserved');
        this.$socket.off('timeslot:released');
      }
    },

    // Socket event handlers
    handleTimeslotCreated(data) {
      this.timeSlots.push(data);
    },
    
    // If the assistant deletes the time
    handleTimeslotDeleted(data) {
      this.timeSlots = this.timeSlots.filter(slot => slot.id !== data.id);
      if (this.reservedTimeslots.has(data.id)) {
        this.reservedTimeslots.delete(data.id);
      }
    },

    handleTimeslotBooked(data) {
      const slotFound = this.timeSlots.find(slot => slot.id === data.id);
      if (slotFound) {
        slotFound.booked = true;
        slotFound.bookedBy = data.studentName;
      }
      if (this.reservedTimeslots.has(data.id)) {
        this.reservedTimeslots.delete(data.id);
      }
    },

    handleTimeslotReserved(data) {
      this.reservedTimeslots.add(data.id);
    },

    handleTimeslotReleased(data) {
      if (this.reservedTimeslots.has(data.id)) {
        this.reservedTimeslots.delete(data.id);
      }
    },

    isReserved(id) {
      return this.reservedTimeslots.has(id);
    },

    selectTime(timeslot) {
      // Don't proceed if slot is booked or reserved
      if (timeslot.booked || this.isReserved(timeslot.id)) {
        return;
      }

  // Reserve the timeslot on the server
    fetch(`/api/timeslots/${timeslot.id}/reserve`, {
      method: "POST"
      })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to reserve timeslot");
        }
        return res.json();
      })
      .then(() => {
        // Store selected timeslot info in store
        this.$store.commit('setSelectedTime', time: timeslot.time, id: timeslot.id, admin: timeslot.assistantId);
        this.$store.commit('setAdmin', timeslot.assistantId);
        this.$store.commit('setSelectedTimeslotId', timeslot.id);
        
        // Navigate to booking page
        this.$router.push("/booking");
      })
      .catch(error => {
        console.error('Error reserving timeslot:', error);
        this.loadTimeslots();
      });
    }
  }
};

</script>

<style scoped>
.timeslot-list {
  margin-bottom: 20px;
}

button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
}
</style>
