const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const path = require('path');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/create', (req, res) => {
    try {
        let { username, email, password, age } = req.body;
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return res.status(500).send(err.message);
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) return res.status(500).send(err.message);
                try {
                    let createdUser = await userModel.create({
                        username,
                        email,
                        password: hash,
                        age,
                    });
                    let token = jwt.sign({ email }, 'shhhhhhhhhhhh');
                    res.cookie('token', token);
                    res.send(createdUser);
                } catch (e) {
                    res.status(500).send(e.message);
                }
            });
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        let user = await userModel.findOne({ email: req.body.email });
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (result) {
                res.send('Login Successful');
            } else {
                res.status(401).send('Invalid Credentials');
            }
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/logout', function (req, res) {
    res.clearCookie('token');
    res.send('Logged out');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
