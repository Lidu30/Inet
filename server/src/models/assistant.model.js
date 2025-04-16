class Assistant { 
    constructor(username, id){
      this.id = id;
      this.username= username;
    }

  get username(){
    return this._username
  }

  get id(){
    return this._id;
  }

  set username(username){
    this._username = username;
  }

  set id (id){
    return this._id = id;
  }
    //här kommer du deklarera eventuella getters, setters eller andra "nödvändiga" metoder
 }
 export default Assistant;