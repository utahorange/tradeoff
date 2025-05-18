const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
// Middleware
app.use(cors());
app.use(express.json());


// Routes

// Create a user
app.post("/register", async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;
        console.log("Attempting to insert user:", { username, email });
        const client = await pool.connect();
        console.log("Database connection successful");
        const newUser = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", 
            [username, email, password]);
        res.json(newUser.rows[0]);
    } catch (error) {
        if(error.code === "23505") {
            if (error.constraint === "unique_username") {
                return res.status(400).json("Username already exists");
            }
            if (error.constraint === "unique_email") {
                return res.status(400).json("Email already exists");
            }
        }
        console.error("Registration error:", error);
        res.status(500).json({ 
            error: "Server Error",
            details: error.message 
        });
    }

});



app.listen(3000, () => {
    console.log("Server is running on port 3000");
});



