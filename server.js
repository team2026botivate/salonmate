const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Change route to work with Vite's proxy
app.get("/api/proxy", async (req, res) => {
  try {
    const response = await axios.get("https://script.google.com/a/macros/botivate.in/s/AKfycbxjYYdBHyeK1n65Er6c76ymzKvBvZr8ixit2_OUTRA/dev"); 
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the app for Vite integration
module.exports = app;

// Only listen if running directly (not through Vite)
if (require.main === module) {
  app.listen(5000, () => console.log("Server running on port 5000"));
}
