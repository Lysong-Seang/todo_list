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


async function addTodo(user_id, text, deadline) {
    const query = `INSERT INTO todos (user_id, text, deadline) VALUES (?, ?, ?)`;
    const result = await connPool.awaitQuery(query, [user_id, text, deadline]);
    return result.insertId;
}

async function getTodos() {
    const query = `SELECT * FROM todos`;
    return await connPool.awaitQuery(query);
}

async function toggleTodo(id) {
    const query = `UPDATE todos SET disabled = NOT disabled WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [id]);
    return result.affectedRows > 0;
}

async function editTodo(id, text) {
    const query = `UPDATE todos SET text = ? WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [text, id]);
    return result.affectedRows > 0;
}

async function deleteTodo(id) {
    const query = `DELETE FROM todos WHERE id = ?`;
    const result = await connPool.awaitQuery(query, [id]);
    return result.affectedRows > 0;
}

async function deleteAllTodos() {
    const query = `DELETE FROM todos`;
    const result = await connPool.awaitQuery(query);
    return result.affectedRows > 0;
}


async function addUser(firstName, email, password) {
    const query = `INSERT INTO users (first_name, email, password) VALUES (?, ?, ?)`;
    await connPool.awaitQuery(query, [firstName, email, password]);
}

async function getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const results = await connPool.awaitQuery(query, [email]);
    return results[0];
  }

async function getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const results = await connPool.awaitQuery(query, [id]);
return results[0]; 
}

module.exports = {
    addTodo,
    getTodos,
    toggleTodo,
    editTodo,
    deleteTodo,
    deleteAllTodos,
    addUser,
    getUserByEmail,
    getUserById
};