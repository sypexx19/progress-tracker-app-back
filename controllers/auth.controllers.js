import db from "../db.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";


// SIGNUP
export const Signin = async (req, res) => {
  try {

    const { user_name, email, password } = req.body;

    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
    }
    const [existing2] = await db.query("SELECT * FROM users WHERE user_name = ?", [user_name]);
    if (existing2.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (user_name, email, user_password) VALUES (?,?,?)`,
      [user_name, email, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};



// LOGIN
export const Login = async (req, res) => {

  try {

    const { email, user_password } = req.body;

    // 1️⃣ Find user by email only
    const [rows] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    const user = rows[0];

    // 2️⃣ Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }


    // 3️⃣ Compare password with hashed password
    const isMatch = await bcrypt.compare(user_password, user.user_password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        email: user.email
      }
    });

  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }

};