const express = require("express");
const router = express.Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require("../model/UserSchema");

// environment variable setup 
const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// api params schema for validation 
const apiParamsSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required()
});

// get request 
router.get('/user', (req, res) => {
    res.send("Router running succesfully");
})


// @route POST api/user/register
// @desc Register user
// @access Public
// post request 
router.post('/register', async(req, res) => {
    let { username, password } = req.body;
    username = username.toLowerCase();

    try {
        const {error}  = apiParamsSchema.validate({username, password});
        if(error){
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            })
        }
        // checking User
        const check_user = await User.findOne({ username });
        if (check_user) {
        return res.status(400).json({
            status: "failed",
            message: "User Already Exists in the Database"
          });
        }
      
        // create user
        const user = await new User({
          username,
          password
        });
        

        // hash user
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        // replace plain password
        user.password = hash;

        // save user into database
        await user.save();
      
        // creating jsonwebtoken
        const payload = {
            user: {
                username,
                id: user.id
            }
        }
        const token = await jwt.sign(payload, JWT_SECRET, {
            expiresIn: '365d'
        });



          return res.json({
              user,
              success: true,
              token,
              message: 'User registered'
          });

    } catch (error) {
        console.log('Error:', error.message);
       res.status(500).json({
           message: "Internal Server Error",
           success: false,
           error: error.message
       }) 
}
});


// @route POST api/v1/user/login 
// @desc Login user
// @access Public
router.post('/login', async(req,res) => {
    // destructure 
    let {username, password} = req.body;
    username = username.toLowerCase();
    console.log(req.body);
    //validate api params 
    const {error} = apiParamsSchema.validate({username, password});
    if(error){
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        })
    }

    try{
        // find user 
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success: false,
                message: "Please Provide the valid username"
            })
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            })
        }

        // create Json Web Token
        const payload = {
            user:{
            username: user.username,
            password: user.password
            }
        }

        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "365d"});

        return res.json({
            success: true,
            token,
            username: user.username,
            _id: user._id
        })

    } catch(error){
        console.log("Error:", error.message)
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        })
    }

})



module.exports = router;
