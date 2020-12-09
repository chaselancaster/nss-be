const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');

// Register
router.post('/register', async (req, res, next) => {
    console.log('register route hit')
    try {
        const { name, password, email } = req.body
        if (!name) {
            return res.send({
              success: false,
              message: 'Name cannot be blank.'
            });
          }
        if (!email) {
            return res.send({
              success: false,
              message: 'Email cannot be blank.'
            });
          }
        if (!password) {
            return res.send({
              success: false,
              message: 'Password cannot be blank.'
            });
          }
        
        const createdUser = await User.create(req.body)
        if (createdUser) {
            req.session.dbId = createdUser._id
            res.json({
                user: createdUser,
                success: true
            })
        }
    } catch (err) {
        res.json({ err })
    }
})

// Login
router.post('/login', async (req, res) => {
    console.log('login route hit')
    try {
        const foundUser = await User.findOne({
            email: req.body.email
        })
        if (foundUser) {
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                req.session.dbId = foundUser._id
                req.session.logged = true;
                res.json({
                    user: foundUser,
                    success: true
                })
            } else {
                res.json({
                    message: 'Invalid username or password'
                })
            }
        }
    } catch (err) {
        res.json({ err })
    }
})

// Update user
router.put('/update/:id', async (req, res) => {
    const userId = req.session.dbId ||req.params.id
    try {
        const user = await User.findById(userId)
        console.log(user, '<- user in update route')
        // Checking if any field is empty and setting the req.body variable to keep the old info
        if (req.body.password === "") {
            req.body.password = user.password;
            console.log(req.body.password, "<- password when field is blank")
        } else if (req.body.email === "") {
            req.body.email = user.email;
            console.log(req.body.email, "<- email when field is blank")
        } else if (req.body.password === "" && req.body.email === "") {
            res.json({
                message: 'Fill in at least one field to update account.'
            })
        }
        // Hashing password
        if (req.body.password !== "" && req.body.password !== user.password) {
            req.body.password = user.hashPassword(req.body.password)
            console.log(req.body.password, '<- password after hashed')
        }
        const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
            new: true
        })
        console.log(updatedUser, '<- updatedUser')
        res.json({
            updatedUser
        })
    } catch (err) {
        console.log (err, '<- err in update user')
    }
})

module.exports = router;