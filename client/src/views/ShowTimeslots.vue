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
        <span v-else-if="isReserved(timeslot.id)" class="status reserved"
          >RESERVED</span
        >
        <span v-else class="status available">AVAILABLE</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
  }),

  computed: {
    timeSlots() {
      // Use the store's getter for available time slots
      return this.$store.getters.alltimeslots;
    },
    isReserved() {
      return (id) => this.$store.state.reservedSlots.has( String(id));
    }
},

  created() {
    this.loadTimeslots();
  },

  methods: {
    loadTimeslots() {
      // Fetch timeslots from server
      fetch("/api/timeslots")
        .then((res) => res.json())
        .then((data) => {
          this.$store.commit("setTimeSlots", data.timeslots);
        })
        .catch((error) => {
          console.error("Error loading timeslots:", error);
        });
    },


    selectTime(timeslot) {
      // Don't proceed if slot is booked or reserved
      if (timeslot.booked || this.isReserved(timeslot.id)) {
        return;
      }

      // Reserve the timeslot on the server
      fetch(`/api/timeslots/${timeslot.id}/reserve`, {
        method: "POST",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to reserve timeslot");
          }
          return res.json();
        })
        .then(() => {
          // Store selected timeslot info in store
          this.$store.commit("setSelectedTime", {
            time: timeslot.time,
            id: timeslot.id,
            admin: timeslot.assistantId,
          });
          this.$store.commit("setAdmin", timeslot.assistantId);
          this.$store.commit("setSelectedTimeslotId", timeslot.id);

          // Navigate to booking page
          this.$router.push("/booking");
        })
        .catch((error) => {
          console.error("Error reserving timeslot:", error);
          this.loadTimeslots();
        });
    },
  },
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
