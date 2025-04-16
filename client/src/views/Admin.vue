<template>
  <h1 class="admin-name">Signed in as {{ username }}</h1>

  <div class="timeslot-form">
    <div class="input-container">
      <label for="newTimeslot" class="form-label"></label>
      <input v-model="newTimeslot" type="time" class="time-input" />
    </div>
  </div>
  <p v-if="msg">{{ msg }} class="text-danger"</p>
  <button type="button" @click="addTimeslot">Add</button>

  <div class="timeslots-list">
    <div
      v-for="(timeslot, index) in timeSlots"
      :key="index"
      class="timeslot-item"
    >
      <label for="newTimeslot" class="form-label"></label>
      <input v-model="selectedTimeslots" type="checkbox" :value="index" />
      <span>Assistant: {{ username }} Time: {{ timeslot }}</span>
    </div>
    <button
      v-if="timeSlots.length !== 0"
      type="button"
      class="remove-button"
      @click="removeTimeslots"
    >
      Remove
    </button>
  </div>
</template>

<script>
export default {
  name: "AdminView",
  data: () => ({
    username: "",
    timeSlots: "",
    newTimeslot: "",
    msg: "",
    selectedTimeslots: [],
  }),

  created() {
    if (!this.$store.state.authenticated) {
      this.$router.push("/login");
      return;
    }
    this.username = this.$store.state.username;
    this.timeSlots = this.$store.state.timeSlots;
  },

  methods: {
    addTimeslot() {
      if (this.newTimeslot) {
        if (!this.timeSlots.includes(this.newTimeslot)) {
          this.timeSlots.push(this.newTimeslot);
          this.newTimeslot = "";
          this.msg = "";
        } else {
          this.msg = "This time already exists";
        }
      }
    },

    removeTimeslots() {
      const sortedIndexes = [...this.selectedTimeslots].sort((a, b) => b - a);

      sortedIndexes.forEach((index) => {
        this.timeSlots.splice(index, 1);
      });
      this.selectedTimeslots = [];
    },
  },
};
</script>

<style scoped>
.admin-name {
  margin-bottom: 20px;
}

.timeslot-form {
  background-color: #fff;
  display: flex;
  align-items: center; /* Aligns vertically in the center */
  justify-content: space-between; /* Pushes elements apart */
  padding: 10px;
}

.timeslots-list {
  margin-bottom: 20px;
}

.timeslot-item {
  margin-bottom: 20px;
}

.time-input {
  width: 100%; /* Makes sure input takes full space */
  border: none;
  outline: none;
  background: none;
}

.input-container {
  flex-grow: 1; /* Makes sure input takes up remaining space */
}

.remove-button {
  background-color: #fff;
  color: red;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
