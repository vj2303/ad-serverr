require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors middleware

const app = express();

// Apply CORS middleware - this allows all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const accountSchema = new mongoose.Schema({
  id: String,
  accounts: [
    {
      name: String,
      adAccount: String,
    },
  ],
});

const Account = mongoose.model("Account", accountSchema);

app.post("/accounts", async (req, res) => {
  const { id, accounts } = req.body;

  if (!id || !Array.isArray(accounts)) {
    return res.status(400).json({ error: "ID and accounts array required" });
  }

  try {
    const existingAccount = await Account.findOne({ id });

    if (existingAccount) {
      existingAccount.accounts = accounts;
      await existingAccount.save();
      return res.json({ message: "Updated successfully", data: existingAccount });
    } else {
      const newAccount = await Account.create({ id, accounts });
      return res.status(201).json({ message: "Created successfully", data: newAccount });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/accounts", async (req, res) => {
  const accounts = await Account.find();
  res.json(accounts);
});

app.get("/accounts/:id", async (req, res) => {
  const { id } = req.params;
  const account = await Account.findOne({ id });

  if (!account) {
    return res.status(404).json({ error: "Account not found" });
  }

  res.json(account);
});

app.delete("/accounts/:id", async (req, res) => {
  const { id } = req.params;
  await Account.deleteOne({ id });
  res.json({ message: "Deleted successfully" });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));