<template>
  <h1>Confirm booking</h1>

  <div class="col">
    <p>Chosen time slot: {{ timeslot }}</p>
    <p>Assistant: {{ admin }}</p>

    <p v-if="msg" class="alert alert-danger">{{ msg }}</p>
    <label for="studentname" class="form-label h4"></label>
    <input
      id="name"
      v-model="studentName"
      type="text"
      placeholder="Name"
      class="form-control"
      required
    />

    <div>
      <button type="button" class="btn btn-primary mt-3 me-2" @click="book">
        book
      </button>
      <button type="button" class="btn btn-danger mt-3" @click="cancel">
        cancel
      </button>
    </div>

    <p></p>
    <p class="text-danger fw">Auto-cancel in {{ countdown }} seconds...</p>
  </div>
</template>

<script>
export default {
  name: "ConfirmBooking",
  data() {
    return {
      timeslot: "", // Example hardcoded value
      admin: "", // Example assistant
      studentName: "",
      msg: "",
      countdown: 10,
    };
  },

  created() {
    this.admin = this.$store.state.admin;
    this.timeslot = this.$store.state.selectedTime;
  },

  mounted() {
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown -= 1; // Decrease countdown
      }
    }, 1000); // Update every second

    // Startar en timer för att automatiskt navigera bort efter 10 sekunder
    this.redirectTimeout = setTimeout(() => {
      this.$router.push("/showTimeslots"); // Gå till Bokningssidan efter 10 sekunder
    }, 10000); // 10 sekunder (10,000 ms)
  },
  methods: {
    book() {
      if (!this.studentName) {
        this.msg = "Please enter your name before booking";
        return;
      }
      this.$router.push("/showTimeslots");
      clearTimeout(this.redirectTimeout);
    },
    cancel() {
      clearTimeout(this.redirectTimeout);
      this.$router.push("/showTimeslots");
    },
  },
};
</script>
