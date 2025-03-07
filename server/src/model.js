import Room from "./models/room.model.js";
import User from "./models/user.model.js";

class Model {
  constructor() {
    this.rooms = {};
    this.users = {};

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
   * Create a room with the given name.
   * @param {String} name - The name of the room.
   * @returns {void}
   */
  createRoom(name) {
    this.rooms[name] = new Room(name);
  }

  /**
   * Return the room object with the matching name.
   * @param {String} name - The name of the room.
   * @returns {Room}
   */
  findRoomByName(name) {
    return this.rooms[name];
  }

  /**
   * Return all the rooms.
   * @returns {Room[]}
   */
  getRooms() {
    return Object.values(this.rooms);
  }

  /**
   * Create a user with the given name.
   * @param {String} id - An unique identifier for the user session.
   * @param {String} name - The name of the user.
   * @returns {void}
   */
  createUser(id, name) {
    this.users[id] = new User(name);
  }

  /**
   * Return the user object with the matching id.
   * @param {String} id - An unique identifier for the user session.
   * @returns {User}
   */
  findUserById(id) {
    return this.users[id];
  }

  /**
   * Push out a message to all connected clients in the given room.
   * @param {Room} room - The room to add the message to.
   * @param {String} message - The message to add.
   * @returns {void}
   */
  broadcast(room, message) {
    this.io.in(room.name).emit("msg", message);
  }

  /**
   * Join a specified room.
   * @param {String} socketID - An unique identifier for the user socket.io session.
   * @param {Room} room - The room to join.
   * @returns {void}
   */
  join(socketId, room) {
    this.io.in(socketId).socketsJoin(room.name);
  }
}

export default new Model();
