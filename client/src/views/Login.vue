<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="checkLogin()">
      <label for="username" class="form-label h4">Welcome</label>
      <p></p>
      <input
        id="username"
        v-model="username"
        type="text"
        class="form-control"
        placeholder="Username..."
        required
      />
      <p></p>
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Password..."
        required
      />
      <p></p>
      <p v-if="msg" class="alert alert-danger">{{ msg }}</p>
      <button type="submit" class="btn btn-dark mt-4 float-end">Log in</button>
    </form>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  components: {},
  data: () => ({
    username: "",
    password: "",
    msg: "",
  }),

  created() {
    // Check if already authenticated
    this.checkAuthStatus();
  },

  methods: {
    checkAuthStatus() {
      fetch("/api/auth/status")
        .then(res => res.json())
        .then(({ authenticated, username }) => {
          if (authenticated) {
            this.$store.commit('setLoggedIn', true);
            this.$store.commit('setUsername', username);
            this.$store.commit('setAuthenticated', true);
            this.$router.push('/admin');
          }
        })
        .catch(error => {
          console.error('Error checking auth status:', error);
        });
    },

    checkLogin() {
      if (this.username.length >= 3 && this.password.length >= 3) {
        fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            username: this.username, 
            password: this.password 
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.authenticated) {
            this.$store.commit('setLoggedIn', true);
            this.$store.commit('setUsername', this.username);
            this.$router.push('/admin');
          } else {
            this.msg = "Wrong username or password!";
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          this.msg = "Login failed. Please try again.";
        });
      } else {
        this.msg = "Username and password must be at least 3 characters";
      }
    }
  }
};
</script>
