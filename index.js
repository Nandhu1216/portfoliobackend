import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

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

app.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save the form data into MongoDB
    await Contact.create({ name, email, message });
    console.log("Contact saved to MongoDB");

    // Set up Nodemailer transporter
    

    res.status(200).json({ success: true, message: 'Form submitted and email sent successfully' });
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).json({ success: false, error: 'Something went wrong, please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
