const express = require ("express");
const axios = require ("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

app.get("/", (req,res) =>{
    res.send("Hubspot calculator is running");
})

app.get("/install", (req,res) =>{
    const redirectUri = process.env.REDIRECT_URI;
      const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=${process.env.SCOPES}&redirect_uri=${redirectUri}`;
      res.redirect(authUrl);
})

app.get("/oauth-callback", async(req,res) =>{
    const code = req.query.code;
    if(!code) return res.status(400).send("Missing code parameter");
try {
  const tokenResponse = await axios.post(
    "https://api.hubapi.com/oauth/v1/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  res.send("✅ App installed successfully! You can close this tab.");
  console.log(tokenResponse.data);
} catch (error) {
  if (error.response) {
    console.error("HubSpot error:", error.response.data);
  } else {
    console.error("Request error:", error.message);
  }
}
});

app.post("/hubspot/action", (req, res) => {
  try {
    const { num1, num2 } = req.body.inputFields || {};

    const number1 = Number(num1);
    const number2 = Number(num2);

    if (isNaN(number1) || isNaN(number2)) {
      return res.status(400).json({
        error: "num1 and num2 must be numbers"
      });
    }

    const result = number1 + number2;

    res.json({
      outputFields: {
        sumResult: result
      }
    });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;