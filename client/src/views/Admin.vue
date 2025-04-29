<template>
  <div class="admin-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="admin-name">Signed in as {{ username }}</h1>
      <button type="button" class="btn btn-danger" @click="logout">Logout</button>
    </div>

    <div class="timeslot-form">
      <div class="input-container">
        <label for="newTimeslot" class="form-label">Add new timeslot:</label>
        <input id="newTimeslot" v-model="newTimeslot" type="time" class="time-input form-control" />
      </div>
      <button type="button" class="btn btn-primary ms-2" @click="addTimeslot">Add</button>
    </div>
    
    <p v-if="msg" :class="msgType === 'error' ? 'alert alert-danger' : 'alert alert-success'">{{ msg }}</p>
    
    <div v-if="loading" class="my-3 text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else class="timeslots-list mt-4">
      <h3>Your timeslots</h3>
      
      <div v-if="timeSlots.length === 0" class="alert alert-info">
        You haven't created any timeslots yet.
      </div>
      
      <div v-else>
        <div 
          v-for="timeslot in timeSlots" 
          :key="timeslot.id" 
          class="timeslot-item d-flex align-items-center mb-2 p-2 border rounded"
        >
          <input 
            v-model="selectedTimeslots" 
            type="checkbox" 
            :value="timeslot.id" 
            class="form-check-input me-2" 
          />
          <span>
            <strong>Time:</strong> {{ timeslot.time }} 
            <span v-if="timeslot.booked" class="badge bg-success ms-2">
              Booked by: {{ timeslot.bookedBy }}
            </span>
            <span v-else class="badge bg-secondary ms-2">Available</span>
          </span>
        </div>
        
        <button
          v-if="selectedTimeslots.length > 0"
          type="button"
          class="btn btn-danger mt-3"
          @click="removeTimeslots"
        >
          Remove Selected
        </button>
      </div>
    </div>
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
    loading: true,
  }),

  created() {
    // Check authentication status first
    this.checkAuthStatus();
  },
  
  mounted() {
    // Setup socket connection for real-time updates
    this.setupSocketListeners();
  },
  
  beforeUnmount() {
    // Clean up socket listeners
    this.cleanupSocketListeners();
  },

  methods: {
    checkAuthStatus() {
      fetch("/api/auth/status")
        .then(res => res.json())
        .then(({ authenticated, username }) => {
          if (!authenticated) {
            this.$router.push("/login");
            return;
          }
          
          this.username = username;
          // Load timeslots after confirming authentication
          this.loadTimeslots();
        })
        .catch(error => {
          console.error('Error checking auth status:', error);
          this.$router.push("/login");
        });
    },
    
    loadTimeslots() {
      this.loading = true;
      
      fetch("/api/timeslots")
        .then(res => res.json())
        .then(data => {
          // Filter to only show this assistant's timeslots
          this.timeSlots = data.timeslots.filter(slot => 
            slot.assistantId === this.username
          );
          this.loading = false;
        })
        .catch(error => {
          console.error('Error loading timeslots:', error);
          this.msg = "Failed to load timeslots";
          this.msgType = "error";
          this.loading = false;
        });
    },
    
    setupSocketListeners() {
      // Listen for real-time timeslot events
      this.$socket = this.$root.io;
      
      if (this.$socket) {
        this.$socket.on('timeslot:created', this.handleTimeslotCreated);
        this.$socket.on('timeslot:deleted', this.handleTimeslotDeleted);
        this.$socket.on('timeslot:booked', this.handleTimeslotBooked);
      }
    },
    
    cleanupSocketListeners() {
      if (this.$socket) {
        this.$socket.off('timeslot:created');
        this.$socket.off('timeslot:deleted');
        this.$socket.off('timeslot:booked');
      }
    },
    
    handleTimeslotCreated(data) {
      if (data.assistantId === this.username) {
        // Add to the list if it's one of this assistant's timeslots
        this.timeSlots.push(data);
      }
    },
    
    handleTimeslotDeleted(data) {
      // Remove from the list
      this.timeSlots = this.timeSlots.filter(slot => slot.id !== data.id);
    },
    
    handleTimeslotBooked(data) {
      // Update the timeslot's booked status
      const index = this.timeSlots.findIndex(slot => slot.id == data.id);
      if (index !== -1) {
        this.timeSlots[index].booked = true;
        this.timeSlots[index].bookedBy = data.studentName;
      }
    },

    addTimeslot() {
      if (!this.newTimeslot) {
        this.msg = "Please select a time";
        this.msgType = "error";
        return;
      }
      
      // Check if time already exists for this assistant
      const exists = this.timeSlots.some(slot => slot.time === this.newTimeslot);
      if (exists) {
        this.msg = "This time already exists";
        this.msgType = "error";
        return;
      }
      
      // Send request to server
      fetch("/api/timeslots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          time: this.newTimeslot
        }),
      })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.error || "Failed to add timeslot");
          });
        }
        return res.json();
      })
      .then(data => {
        // Timeslot will be added via socket event
        this.msg = "Timeslot added successfully";
        this.msgType = "success";
        this.newTimeslot = "";
      })
      .catch(error => {
        console.error('Error adding timeslot:', error);
        this.msg = error.message || "Failed to add timeslot";
        this.msgType = "error";
      });
    },

    removeTimeslots() {
      if (this.selectedTimeslots.length === 0) {
        return;
      }
      
      // Create a copy to avoid modification during iteration
      const toDelete = [...this.selectedTimeslots];
      
      // Delete each selected timeslot
      const deletePromises = toDelete.map(id => 
        fetch(`/api/timeslots/${id}`, {
          method: "DELETE"
        })
      );
      
      Promise.all(deletePromises)
        .then(() => {
          this.msg = "Selected timeslots removed";
          this.msgType = "success";
          this.selectedTimeslots = [];
          // Timeslots will be removed via socket events
        })
        .catch(error => {
          console.error('Error removing timeslots:', error);
          this.msg = "Failed to remove some timeslots";
          this.msgType = "error";
        });
    },
    
    logout() {
      fetch("/api/logout", {
        method: "POST"
      })
      .then(() => {
        this.$store.commit('setLoggedIn', false);
        this.$store.commit('setUsername', '');
        this.$store.commit('setAuthenticated', false);
        this.$router.push("/login");
      })
      .catch(error => {
        console.error('Logout error:', error);
        this.msg = "Failed to logout";
        this.msgType = "error";
      });
    }
  },
};
</script>

<style scoped>
.admin-container {
  max-width: 800px;
  margin: 0 auto;
}

.admin-name {
  margin-bottom: 20px;
}

.timeslot-form {
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.time-input {
  border: 1px solid #ced4da;
  padding: 8px;
  border-radius: 4px;
}

.input-container {
  flex-grow: 1;
}

.timeslot-item {
  background-color: #fff;
  transition: background-color 0.2s;
}

.timeslot-item:hover {
  background-color: #f8f9fa;
}
</style>