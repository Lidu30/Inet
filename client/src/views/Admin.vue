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
    timeSlots: [],
    newTimeslot: "",
    msg: "",
    msgType: "error",
    selectedTimeslots: [],
    loading: false,
  }),

  created() {
    this.checkAuthStatus();
  },

  mounted() {
    this.setupSocketListeners();
  },

  beforeUnmount() {
    this.cleanupSocketListeners();
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
          // Filter to only show this assistant's timeslots
          this.timeSlots = data.timeslots.filter(
            (slot) => slot.assistantId === this.username
          );
          this.loading = false;
        })
        .catch((error) => {
          console.error("Error loading timeslots:", error);
          this.msg = "Failed to load timeslots";
          this.msgType = "error";
          this.loading = false;
        });
    },

    setupSocketListeners() {
      this.$socket = this.$root.socket;
      if (this.$socket) {
        this.$socket.on("timeslot:created", this.handleTimeslotCreated);
        this.$socket.on("timeslot:deleted", this.handleTimeslotDeleted);
        this.$socket.on("timeslot:booked", this.handleTimeslotBooked);
      }
    },

    cleanupSocketListeners() {
      if (this.$socket) {
        this.$socket.off("timeslot:created");
        this.$socket.off("timeslot:deleted");
        this.$socket.off("timeslot:booked");
      }
    },

    handleTimeslotCreated(data) {
      if (data.assistantId === this.username) {
        // Add to the list if it's one of this assistant's timeslots
        this.timeSlots.push(data);
      }
    },

    handleTimeslotDeleted(data) {
      // Convert the ID to string to ensure type consistency
      const idToRemove = String(data.id);

      // Remove from the list - ensure string comparison
      this.timeSlots = this.timeSlots.filter(
        (slot) => String(slot.id) !== idToRemove
      );

      // Also remove from selectedTimeslots if it was selected
      this.selectedTimeslots = this.selectedTimeslots.filter(
        (id) => String(id) !== idToRemove
      );
    },

    handleTimeslotBooked(data) {
      // Update the timeslot's booked status
      const index = this.timeSlots.findIndex((slot) => slot.id === data.id);
      if (index !== -1) {
        this.timeSlots[index].booked = true;
        this.timeSlots[index].bookedBy = data.studentName;
      }
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

    logout() {
      fetch("/api/logout", {
        method: "POST",
      })
        .then(() => {
          this.$store.commit("setLoggedIn", false);
          this.$store.commit("setUsername", "");
          this.$store.commit("setAuthenticated", false);
          this.$router.push("/login");
        })
        .catch((error) => {
          console.error("Logout error:", error);
          this.msg = "Failed to logout";
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
