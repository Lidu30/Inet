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
        {{ timeslot }} -> {{ admin }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    admin: "Jacob",
    selectedTimeSlot: "",
    timeSlots: [],
  }),

  watch: {
    "$store.state.timeSlots": {
      handler(newTimeSlots) {
        console.log("Time slots updated in store:", newTimeSlots);
        this.timeSlots = newTimeSlots;
      },
      deep: true,
      immediate: true,
    },
  },

  created() {
    this.timeSlots = this.$store.state.timeSlots;
  },

  // Add watcher to keep local timeSlots in sync with store

  methods: {
    selectTime(timeslot) {
      this.selectedTimeSlot = timeslot;
      if (this.selectedTimeSlot) {
        this.$store.dispatch("admin", { adminName: this.admin });
        this.$store.dispatch("selectedTime", {
          selectedTime: this.selectedTimeSlot,
        });
        this.$router.push("/booking");
      }
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
  cursor: pointer;
  font-size: 14px;
}
</style>
