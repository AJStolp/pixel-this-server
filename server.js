const express = require("express");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/get-signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp: timestamp, upload_preset: "ml_default" },
    cloudinary.config().api_secret
  );

  res.json({ timestamp, signature, api_key: cloudinary.config().api_key });
});

app.get("/list-images", async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression("resource_type:image")
      .sort_by("created_at", "desc")
      .max_results(30)
      .execute();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch images from Cloudinary" });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
