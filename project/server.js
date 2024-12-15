const express = require('express');
const app = express();
const data = require('./data'); 
const bcrypt = require('bcrypt'); 
const session = require('express-session');

app.set('view engine', 'pug');

const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
      secret: 'idonknowwhattoputinhere2024',
      resave: false,
      saveUninitialized: false,
    })
  );
  
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    try {
        res.render('mainpage', {
            title: 'HomePage',
            isLoggedIn: true,
            
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }

});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await data.getUserByEmail(email);
        if (!user) {
          return res.send('Invalid email or password!');
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.send('Invalid email or password!');
        }
    
        req.session.userId = user.id;
        res.redirect('/');
      } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
      } 
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal server error.');
        }
        res.redirect('/login');
    });
});


app.post('/signup', async (req, res) => {
    const { firstName, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = await data.addUser(firstName, email, hashedPassword);
        req.session.userId= newuser;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }
});

app.get('/api/todos',checkAuth, async (req, res) => {
    try {
        const todos = await data.getTodos(req.session.userId);
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve todos' });
    }
});

app.post('/api/todos', checkAuth, async (req, res) => {
    const { text, date } = req.body;
    console.log("Received Data:", { text, date }); 

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    try {
        const id = await data.addTodo(req.session.userId, text, date|| null);
        res.status(201).json({ id, text, date:date ||null, disabled: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add todo' });
    }
});

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

app.delete('/api/todos', async (req, res) => {
    try {
        await data.deleteAllTodos();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete all todos' });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
