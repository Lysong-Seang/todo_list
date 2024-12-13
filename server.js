const express = require('express');
const app = express();
const data = require('./data'); // Import the data module for database operations

app.set('view engine', 'pug');

const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Render the homepage
app.get('/', (req, res) => {
    res.render('mainpage.pug', {
        title: 'HomePage'
    });
});

// API: Get all to-dos
app.get('/api/todos', async (req, res) => {
    try {
        const todos = await data.getTodos();
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve todos' });
    }
});

// API: Add a new to-do
app.post('/api/todos', async (req, res) => {
    const { text, date } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    try {
        const id = await data.addTodo(text, date|| null);
        res.status(201).json({ id, text, date:date ||null, disabled: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add todo' });
    }
});

// API: Toggle a to-do
app.put('/api/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
        const success = await data.toggleTodo(id);
        if (!success) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to toggle todo' });
    }
});

// API: Edit a to-do
app.patch('/api/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { text } = req.body;
    if (!text || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    try {
        const success = await data.editTodo(id, text);
        if (!success) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to edit todo' });
    }
});

// API: Delete a specific to-do
app.delete('/api/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    try {
        const success = await data.deleteTodo(id);
        if (!success) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

// API: Delete all to-dos
app.delete('/api/todos', async (req, res) => {
    try {
        await data.deleteAllTodos();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete all todos' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
