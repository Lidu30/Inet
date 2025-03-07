/**
 * @class Room
 */
class Room {
  constructor(name) {
    this.name = name;
    this.messages = [];
  }

  /**
   * Add a message.
   * @param {String} message - The message to add.
   * @returns {void}
   */
  addMessage(message) {
    this.messages.push(message);
  }
}

export default Room;
