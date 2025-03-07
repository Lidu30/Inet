/**
 * @class User
 */
class User {
  constructor(name) {
    this.name = name;
    this.currentRoom = null;
  }

  /**
   * Join a specified room.
   * @param {Room} room - The room to join.
   * @returns {void}
   */
  joinRoom(room) {
    this.currentRoom = room;
  }
}

export default User;
