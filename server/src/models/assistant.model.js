class Assistant { 
  constructor(username, id) {
    this._username = username;
    this._id = id;
  }

  /**
   * Get the username of this assistant
   * @returns {String} The username
   */
  get username() {
    return this._username;
  }

  /**
   * Get the ID of this assistant
   * @returns {String} The ID
   */
  get id() {
    return this._id;
  }

  /**
   * Set the username of this assistant
   * @param {String} username - The new username
   */
  set username(username) {
    this._username = username;
  }

  /**
   * Set the ID of this assistant
   * @param {String} id - The new ID
   */
  set id(id) {
    this._id = id;
  }
}

export default Assistant;