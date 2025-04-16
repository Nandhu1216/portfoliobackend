import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();

// Debug: Check environment variables are loaded
console.log("Loaded ENV EMAIL_USER:", process.env.EMAIL_USER);
console.log("Loaded ENV MONGO_URI:", process.env.MONGO_URI ? "Loaded" : "Missing");

app.use(cors({
  origin: 'https://frontend-one-indol-68.vercel.app',
}));

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// Define Contact model
const Contact = mongoose.model('Contact', {
  name: String,
  email: String,
  message: String,
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('🚀 Your service is live');
});

// Contact form handler
app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("📩 Incoming form:", { name, email, message });

    if (!name || !email || !message) {
      console.log("⚠️ Validation failed");
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to MongoDB
    await Contact.create({ name, email, message });
    console.log("✅ Contact saved to MongoDB");

    // Nodemailer transporter setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify transporter
    try {
      await transporter.verify();
      console.log("✅ Nodemailer transporter is ready");
    } catch (verifyErr) {
      console.error("❌ Transporter verify failed:", verifyErr);
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // You receive the email
      subject: '📬 New Contact Form Submission',
      html: `
        <h2>New Message from Portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully:", info.response);
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
    }

    // Respond success
    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    res.status(500).json({ success: false, error: 'Something went wrong, please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
