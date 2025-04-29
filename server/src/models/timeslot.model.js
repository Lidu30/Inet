class Timeslot { 
  constructor(time, assistant_id, timeslot_id, booked = false, booked_by = null) {
    this.time = time;
    this.assistant_id = assistant_id;
    this.timeslot_id = timeslot_id;
    this.booked = booked;
    this.booked_by = booked_by;
  }

  /**
   * Get the time of this timeslot
   * @returns {String} The time
   */
  getTime() {
    return this.time;
  }

  /**
   * Set the time of this timeslot
   * @param {String} time - The new time
   */
  setTime(time) {
    this.time = time;
  }

  /**
   * Get the assistant ID for this timeslot
   * @returns {String} The assistant ID
   */
  getAssistantId() {
    return this.assistant_id;
  }

  /**
   * Get the ID of this timeslot
   * @returns {Number} The timeslot ID
   */
  getId() {
    return this.timeslot_id;
  }

  /**
   * Check if this timeslot is booked
   * @returns {Boolean} True if booked
   */
  isBooked() {
    return this.booked;
  }

  /**
   * Get the name of the student who booked this timeslot
   * @returns {String|null} The student name or null if not booked
   */
  getBookedBy() {
    return this.booked_by;
  }

  /**
   * Book this timeslot for a student
   * @param {String} studentName - The name of the student
   */
  book(studentName) {
    this.booked = true;
    this.booked_by = studentName;
  }

  /**
   * Unbook this timeslot
   */
  unbook() {
    this.booked = false;
    this.booked_by = null;
  }
}

export default Timeslot;