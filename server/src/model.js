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
  createAssistant(id, username) {
    this.assistants[id] = new Assistant(username);
  }

  /**
   * Return the user object with the matching id.
   * @param {String} id - An unique identifier for the user session.
   * @returns {User}
   */
  findAssistantById(id) {
    return this.assistant[id];
  }


}

export default new Model();
