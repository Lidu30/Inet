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

  methods: {
    authenticate() {
      const { commit, getters } = this.$store;
      const { push } = this.$router;

      commit("setAuthenticated", true);
      push(getters.isAuthenticated === true ? "/rooms" : "/login");
    },

    checkLogin() {
      const tempPassword = "valid1";
      const validPassword =
        /[a-zA-Z]/.test(this.password) && /\d/.test(this.password);
      const validUsername =
        /[a-zA-Z]/.test(this.username) && /\d/.test(this.username);

      if (validUsername && this.password === tempPassword && validPassword) {
        this.$store.dispatch("login", {
          username: this.username,
          password: this.password,
        });
        this.$router.push("/admin");
        this.msg = "";

        //  this.$store.commit('setLoggedIn', true);
        //  this.$store.commit('setUsername' , this.username);
      } else {
        this.msg = "Wrong username or password!";
      }
    },
  },
};
</script>
