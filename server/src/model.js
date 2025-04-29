import Assistant from "./models/assistant.model.js";
import TimeSlot from "./models/timeslot.model.js";
import Room from "./models/room.model.js";
import User from "./models/user.model.js";
import db from "./db.js";

class Model {
  constructor() {
    this.assistants = {};
    this.timeslots = {};
    this.rooms = {};
    this.users = {};
    this.reservedTimeslots = new Set();
    
    this.io = undefined;
  }

  /**
   * Initialize the model after its creation.
   * @param {SocketIO.Server} io - The socket.io server instance.
   * @returns {void}
   */
  async init(io) {
    this.io = io;
    
    // Load existing timeslots from the database
    try {
      const slots = await db.all('SELECT * FROM timeslots');
      slots.forEach(slot => {
        this.timeslots[slot.timeslot_id] = new TimeSlot(
          slot.time,
          slot.assistant_id,
          slot.timeslot_id,
          slot.booked === 1,
          slot.booked_by
        );
      });
      console.log(`Loaded ${slots.length} timeslots from database`);
    } catch (error) {
      console.error('Error loading timeslots:', error);
    }
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
   * Return all rooms.
   * @returns {Room[]}
   */
  getRooms() {
    return Object.values(this.rooms);
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
   * Join a socket to a room.
   * @param {String} socketId - An unique identifier for the socket.
   * @param {Room} room - The room to join.
   * @returns {void}
   */
  join(socketId, room) {
    this.io.sockets.sockets.get(socketId).join(room.name);
  }

  /**
   * Broadcast a message to all sockets in a room.
   * @param {Room} room - The room to broadcast to.
   * @param {String} message - The message to broadcast.
   * @returns {void}
   */
  broadcast(room, message) {
    this.io.to(room.name).emit("message", message);
  }

  /**
   * Create an assistant with the given name.
   * @param {String} username - The username of the assistant.
   * @param {String} id - An unique identifier for the assistant session.
   * @returns {void}
   */
  createAssistant(username, id) {
    this.assistants[id] = new Assistant(username, id);
  }

  /**
   * Return the assistant object with the matching id.
   * @param {String} id - An unique identifier for the assistant session.
   * @returns {String} - The username of the assistant
   */
  findAssistantById(id) {
    const assistant = this.assistants[id];
    return assistant ? assistant.username : undefined;
  }

  /**
   * Create a new timeslot.
   * @param {Number} id - The timeslot ID.
   * @param {String} assistantId - The assistant's username.
   * @param {String} time - The time for the slot.
   * @returns {TimeSlot} - The created timeslot
   */
  createTimeslot(id, assistantId, time) {
    const timeslot = new TimeSlot(time, assistantId, id);
    this.timeslots[id] = timeslot;
    return timeslot;
  }

  /**
   * Get all timeslots.
   * @returns {TimeSlot[]} - Array of all timeslots
   */
  getAllTimeslots() {
    return Object.values(this.timeslots);
  }

  /**
   * Find a timeslot by ID.
   * @param {Number} id - The timeslot ID
   * @returns {TimeSlot} - The timeslot or undefined if not found
   */
  findTimeslotById(id) {
    return this.timeslots[id];
  }

  /**
   * Remove a timeslot.
   * @param {Number} id - The timeslot ID
   * @returns {Boolean} - True if removed, false if not found
   */
  removeTimeslot(id) {
    if (this.timeslots[id]) {
      delete this.timeslots[id];
      if (this.reservedTimeslots.has(id.toString())) {
        this.reservedTimeslots.delete(id.toString());
      }
      return true;
    }
    return false;
  }

  /**
   * Check if a timeslot is currently reserved.
   * @param {Number} id - The timeslot ID
   * @returns {Boolean} - True if reserved
   */
  isTimeslotReserved(id) {
    return this.reservedTimeslots.has(id.toString());
  }

  /**
   * Reserve a timeslot.
   * @param {Number} id - The timeslot ID
   * @returns {Boolean} - True if successfully reserved
   */
  reserveTimeslot(id) {
    const timeslot = this.findTimeslotById(id);
    
    if (!timeslot || timeslot.isBooked() || this.isTimeslotReserved(id)) {
      return false;
    }
    
    this.reservedTimeslots.add(id.toString());
    return true;
  }

  /**
   * Release a reserved timeslot.
   * @param {Number} id - The timeslot ID
   * @returns {Boolean} - True if successfully released
   */
  releaseTimeslot(id) {
    if (this.reservedTimeslots.has(id.toString())) {
      this.reservedTimeslots.delete(id.toString());
      return true;
    }
    return false;
  }

  /**
   * Book a timeslot with a student name.
   * @param {Number} id - The timeslot ID
   * @param {String} studentName - The name of the student booking
   * @returns {Boolean} - True if successfully booked
   */
  bookTimeslot(id, studentName) {
    const timeslot = this.findTimeslotById(id);
    
    if (!timeslot || timeslot.isBooked()) {
      return false;
    }
    
    timeslot.book(studentName);
    this.releaseTimeslot(id);
    return true;
  }
}

export default new Model();