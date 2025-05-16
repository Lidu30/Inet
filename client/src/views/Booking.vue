<template>
  <h1>Confirm booking</h1>

  <div class="col">
    <p>Chosen time slot: {{ selectedTime.timeslot }}</p>
    <p>Assistant: {{ selectedTime.assistant_id }}</p>

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
      selectedTime: {
        timeslot: "",
        timeslotId: null,
        assistant_id: ""
      },
      studentName: "",
      msg: "",
      countdown: 10,
    };
  },

  created() {
    this.selectedTime = this.$store.state.selectedTime;

    // if (!this.selectedTime.time || !this.admin || !this.timeslotId) {
      // this.$router.push("/showTimeslots");
    // }
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
      // Send booking request to server
      fetch(`/api/timeslots/${this.timeslotId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: this.studentName,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Failed to book timeslot");
            });
          }
          return res.json();
        })
        .then(() => {
          // Redirect back to timeslots page
          this.$router.push("/showTimeslots");
          clearTimeout(this.redirectTimeout);
        })
        .catch((error) => {
          console.error("Error booking timeslot:", error);
          this.msg = error.message || "Failed to book timeslot";

          // Still redirect after a short delay
          setTimeout(() => {
            this.$router.push("/showTimeslots");
            clearTimeout(this.redirectTimeout);
          }, 2000);
        });
    },
    cancel() {
      // Send cancellation request to server
      fetch(`/api/timeslots/${this.timeslotId}/cancel`, {
        method: "POST",
      })
        .then(() => {
          // Redirect back to timeslots page
          clearTimeout(this.redirectTimeout);
          this.$router.push("/showTimeslots");
        })
        .catch((error) => {
          console.error("Error canceling reservation:", error);
          // Still redirect on error
          clearTimeout(this.redirectTimeout);
          this.$router.push("/showTimeslots");
        });
    },
  },
};
</script>
