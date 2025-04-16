import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://frontend-one-indol-68.vercel.app',
}));

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const Contact = mongoose.model('Contact', {
  name: String,
  email: String,
  message: String,
});

app.use(bodyParser.json());

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Your service is live');
});

app.post('https://portfoliobackend-itwl.onrender.com', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to MongoDB
    await Contact.create({ name, email, message });

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Mail content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // You receive this
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Message from Portfolio</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email send error:", error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });

  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ success: false, error: 'Something went wrong, please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
