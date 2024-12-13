// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  host: "127.0.0.1",// this will work
  port: 3307,
  user: "C4131F24U102",
  database: "C4131F24U102",
  password: "10454", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});
// later you can use connPool.awaitQuery(query, data) -- it will return a promise for the query results.


// Add a new to-do
async function addTodo(text, deadline) {
    const query = `INSERT INTO todo (text, deadline) VALUES (?, ?)`;
    const result = await connPool.awaitQuery(query, [text, deadline]);
    return result.insertId;
}

// Get all to-dos
async function getTodos() {
    const query = `SELECT * FROM todo`;
    return await connPool.awaitQuery(query);
}

// Update a to-do (toggle its disabled state)
async function toggleTodo(id) {
    const query = `UPDATE todo SET disabled = NOT disabled WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [id]);
    return result.affectedRows > 0;
}

// Edit a to-do
async function editTodo(id, text) {
    const query = `UPDATE todo SET text = ? WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [text, id]);
    return result.affectedRows > 0;
}

// Delete a specific to-do
async function deleteTodo(id) {
    const query = `DELETE FROM todo WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [id]);
    return result.affectedRows > 0;
}

// Delete all to-dos
async function deleteAllTodos() {
    const query = `DELETE FROM todo`;
    const result = await connPool.awaitQuery(query);
    return result.affectedRows > 0;
}

module.exports = {
    addTodo,
    getTodos,
    toggleTodo,
    editTodo,
    deleteTodo,
    deleteAllTodos
};