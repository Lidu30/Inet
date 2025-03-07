<template>
  <div class="row">
    <div class="col-3"></div>
    <ul class="col-6 list-group">
      <li
        v-for="(msg, i) in messages"
        :key="i"
        type="button"
        class="list-group-item py-1"
      >
        {{ msg }}
      </li>
      <form @submit.prevent="send()">
        <label for="message"></label>
        <input
          id="message"
          v-model="message"
          type="text"
          class="form-control form-control-sm"
          placeholder="message..."
          required
        />
        <button type="submit" class="btn btn-dark mt-4 float-end">SEND</button>
      </form>
    </ul>
    <div class="col-3"></div>
  </div>
</template>

<script>
export default {
  name: "RoomView",
  components: {},
  data() {
    return {
      name: this.$route.params.name,
      messages: [],
      message: "",
    };
  },
  async mounted() {
    const res = await fetch(`/api/rooms/${this.name}/messages`);
    const { messages } = await res.json();
    this.messages = messages;

    const { socket } = this.$root;
    socket.on("msg", (msg) => {
      this.messages = [...this.messages, msg];
    });
  },
  methods: {
    send() {
      fetch(`/api/rooms/${this.name}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: this.message }),
      }).catch(console.error);

      this.message = "";
    },
  },
};
</script>
