<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="authenticate()">
      <label for="username" class="form-label h4">What is Your name?</label>
      <input
        id="username"
        v-model="username"
        type="text"
        class="form-control"
        placeholder="username..."
        required
      />
      <button type="submit" class="btn btn-dark mt-4 float-end">OK</button>
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
  }),
  methods: {
    authenticate() {
      const { commit } = this.$store;
      const { push } = this.$router;

      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: this.username }),
      })
        .then((res) => res.json())
        .then(({ authenticated }) => {
          commit("setAuthenticated", authenticated);
          push(authenticated === true ? "/rooms" : "/login");
        })
        .catch(console.error);
    },
  },
};
</script>
