import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolvePath } from "./util.js";

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
    password TEXT NOT NULL,
    timeslots TEXT
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


export default db;
