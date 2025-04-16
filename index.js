import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';


dotenv.config();
const app = express();

// Enable CORS for the frontend (make sure to replace this with the correct origin if needed)
app.use(cors({
  origin: 'https://frontend-one-indol-68.vercel.app', // Change this if your frontend runs on a different port
}));

const PORT = process.env.PORT || 3000;  // Use the port from .env or fallback to 3000

// MongoDB connection using URI from .env
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// MongoDB Schema for Contact
const Contact = mongoose.model('Contact', {
  name: String,
  email: String,
  message: String,
});

// Middleware to parse JSON requests
app.use(bodyParser.json()); // Use bodyParser.json() for parsing JSON

// Serve static files like index.html
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Your service is live');
});
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    
    // Save to MongoDB
    await Contact.create({ name, email, message });
    // Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS    // your app password (not your Gmail password)
  }
});

// Email content
const mailOptions = {
  from: formData.email,
  to: process.env.EMAIL_USER, // Where you want to receive the form details
  subject: 'New Contact Form Submission',
  html: `
    <h2>New Message from Portfolio</h2>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Message:</strong> ${formData.message}</p>
  `
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Email send error:", error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

    
    // Send success response with a success flag
    res.status(200).json({ success: true, message: 'Form submitted successfully' });
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ success: false, error: 'Something went wrong, please try again.' });
  }
});

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS    // your app password (not your Gmail password)
  }
});

// Email content
const mailOptions = {
  from: formData.email,
  to: process.env.EMAIL_USER, // Where you want to receive the form details
  subject: 'New Contact Form Submission',
  html: `
    <h2>New Message from Portfolio</h2>
    <p><strong>Name:</strong> ${formData.name}</p>
    <p><strong>Email:</strong> ${formData.email}</p>
    <p><strong>Message:</strong> ${formData.message}</p>
  `
};

// Send the email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error("Email send error:", error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
