import Assistant from "./models/assistant.model.js";
import TimeSlot from "./models/timeslot.model.js";

class Model {
  constructor() {
    this.assistants = {};
    this.timeslots = {};

    this.io = undefined;
  }

  /**
   * Initialize the model after its creation.
   * @param {SocketIO.Server} io - The socket.io server instance.
   * @returns {void}
   */
  init(io) {
    this.io = io;
  }

  /**
   * Create a user with the given name.
   * @param {String} id - An unique identifier for the assistant session.
   * @param {String} username - The username of the admin
   * @returns {void}
   */
  createUser(id, username) {
    this.users[id] = new Assistant(username);
  }

  /**
   * Return the user object with the matching id.
   * @param {String} id - An unique identifier for the user session.
   * @returns {User}
   */
  findUserById(id) {
    return this.users[id];
  }


}

export default new Model();
