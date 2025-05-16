<template>
  <h1 class="admin-name">Signed in as {{ username }}</h1>

  <div class="timeslot-form">
    <div class="input-container">
      <label for="newTimeslot" class="form-label"></label>
      <input v-model="newTimeslot" type="time" class="time-input" />
    </div>
  </div>
  <p v-if="msg" class="text-danger">{{ msg }}</p>
  <button type="button" @click="addTimeslot">Add</button>

  <div class="timeslots-list">
    <div v-for="timeslot in timeSlots" :key="timeslot.id" class="timeslot-item">
      <label for="newTimeslot" class="form-label"></label>
      <input v-model="selectedTimeslots" type="checkbox" :value="timeslot.id" />
      <span>Assistant: {{ username }} Time: {{ timeslot.time }}</span>
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
    newTimeslot: "",
    msg: "",
    msgType: "error",
    selectedTimeslots: [],
    loading: false,
  }),

  computed: {
    timeSlots() {
      // Filter timeslots from the store to only show this admin's slots
      return this.$store.state.timeSlots.filter(
        slot => slot.assistantId === this.username
      );
    }
  },

  created() {
    this.checkAuthStatus();
  },


  methods: {
    checkAuthStatus() {
      fetch("/api/auth/status")
        .then((res) => res.json())
        .then(({ authenticated, username }) => {
          if (!authenticated) {
            this.$router.push("/login");
            return;
          }

          this.username = username;
          // Load timeslots after confirming authentication
          this.loadTimeslots();
        })
        .catch((error) => {
          console.error("Error checking auth status:", error);
          this.$router.push("/login");
        });
    },

    loadTimeslots() {
      this.loading = true;

      fetch("/api/timeslots")
        .then((res) => res.json())
        .then((data) => {
          this.$store.commit("setTimeSlots", data.timeslots);
          this.loading = false;
        })
        .catch((error) => {
          console.error("Error loading timeslots:", error);
          this.msg = "Failed to load timeslots";
          this.msgType = "error";
          this.loading = false;
        });
    },

    addTimeslot() {
      if (!this.newTimeslot) {
        return;
      }

      // Check if time already exists for this assistant
      const exists = this.timeSlots.some(
        (slot) => slot.time === this.newTimeslot
      );
      if (exists) {
        this.msg = "This time already exists";
        setTimeout(() => {
          this.msg = "";
        }, 4000);
        return;
      }

      // Send request to server
      fetch("/api/timeslots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: this.newTimeslot,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Failed to add timeslot");
            });
          }
          return res.json();
        })
        .then(() => {
          this.newTimeslot = "";
          this.msg = "";
        })
        .catch((error) => {
          console.error("Error adding timeslot:", error);
          this.msg = error.message || "Failed to add timeslot";
        });
    },

    removeTimeslots() {
      if (this.selectedTimeslots.length === 0) {
        return;
      }

      // Create a copy to avoid modification during iteration
      const toDelete = [...this.selectedTimeslots];

      // Delete each selected timeslot
      const deletePromises = toDelete.map((id) =>
        fetch(`/api/timeslots/${id}`, {
          method: "DELETE",
        })
      );

      Promise.all(deletePromises)
        .then(() => {
          this.selectedTimeslots = [];
          // Timeslots will be removed via socket events
        })
        .catch((error) => {
          console.error("Error removing timeslots:", error);
          this.msg = "Failed to remove some timeslots";
        });
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
