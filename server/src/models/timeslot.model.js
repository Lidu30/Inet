import db from "../db.js";

class Timeslot { 
    constructor(time, assistant_id, timeslot_id, booked, booked_by){
      this.time = time;
      this.assistant_id = assistant_id;
      this.timeslot_id = timeslot_id;
      this.booked = booked;
      this.booked_by = booked_by;
    }

    constructor(time, assistant_id, timeslot_id){
      this.time = time;
      this.assistant_id = assistant_id;
      this.timeslot_id = timeslot_id;
      this.booked = false;
      this.booked_by = null;
    }

    //här kommer du deklarera eventuella getters, setters eller andra "nödvändiga" metoder

    getTime() {
      return this.time
    }

    setTime(time) {
      this.time = time
    }

    getAssistant() {
      return this.time
    }

    setAssistant(time) {
      this.time = time
    }

    getId() {
      return this.timeslot_id
    }

    isBooked() {
      return this.booked
    }

    book(studentName) {
      this.booked = true
      this.booked_by = studentName
    }

    unbook() {
      this.booked = false
      this.booked_by = null
    }

    

 }
 export default Timeslot;