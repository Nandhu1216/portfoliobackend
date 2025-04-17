import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch'; // npm install node-fetch

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://frontend-nandhu.vercel.app',
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

app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 1. Save to MongoDB
    await Contact.create({ name, email, message });
    console.log("Saved to MongoDB");

    // 2. Forward to Formspree
    const formspreeRes = await fetch('https://formspree.io/f/xvgknypn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    if (!formspreeRes.ok) {
      console.error("Formspree error:", await formspreeRes.text());
      return res.status(500).json({ success: false, error: 'Email failed' });
    }

    res.status(200).json({ success: true, message: 'Saved and email sent' });

  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ success: false, error: 'Something went wrong, please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});