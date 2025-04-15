import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolvePath } from "./util.js";

console.log("DB path:", resolvePath("db.sqlite"));

sqlite3.verbose();

// Open and initialize the database
const db = await open({
  filename: resolvePath("db.sqlite"),
  driver: sqlite3.Database,
});

/*
await db.run("DROP TABLE IF EXISTS lorem");
await db.run("CREATE TABLE lorem (info TEXT)");

const statement = await db.prepare("INSERT INTO lorem VALUES (?)");
for (let i = 0; i < 10; i += 1) {
  statement.run(`ipsum ${i}`);
}
statement.finalize();
*/

// Create table 'users' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )
`);


const username = "test1";
const password = "test1";

try {
  await db.run("INSERT INTO users VALUES (?, ?)", [
    username,
    password,
  ]);
  console.log("Dummy user added successfully!");
} catch (error) {
  console.error("Error inserting dummy user:", error.message);
}

// Create table 'timeslots' if it doesn't already exist
await db.run(`
  CREATE TABLE IF NOT EXISTS timeslots (
    timeslot_id INTEGER PRIMARY KEY,
    assistant_id TEXT NOT NULL,
    time TEXT NOT NULL,
    booked INTEGER NOT NULL,
    booked_by TEXT
  )
`);

const timeslot_id = 1;
const assistant_id = "Jacob1";
const time = "15:00";
const booked = 0;
const booked_by = null;

try {
  await db.run("INSERT INTO timeslots VALUES (?, ?, ?, ?, ?)", [
    timeslot_id,
    assistant_id,
    time,
    booked,
    booked_by
  ]);
  console.log("Dummy timeslot added successfully!");
} catch (error) {
  console.error("Error inserting dummy timeslot:", error.message);
}



export default db;
