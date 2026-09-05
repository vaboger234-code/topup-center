const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Store settings
app.get("/api/settings", (req, res) => {
  res.json({
    storeName: "Free Fire Top Up",
    upiId: "vaibhavmkcues82h@fam",
    qrImageUrl: ""
  });
});

// Diamond packages
app.get("/api/products", (req, res) => {
  res.json([
    {
      id: "25",
      name: "25 Diamonds",
      description: "Free Fire Diamonds",
      price: 25
    },
    {
      id: "50",
      name: "50 Diamonds",
      description: "Free Fire Diamonds",
      price: 45
    },
    {
      id: "100",
      name: "100 Diamonds",
      description: "Free Fire Diamonds",
      price: 85
    },
    {
      id: "310",
      name: "310 Diamonds",
      description: "Free Fire Diamonds",
      price: 240
    },
    {
      id: "520",
      name: "520 Diamonds",
      description: "Free Fire Diamonds",
      price: 400
    },
    {
      id: "1060",
      name: "1060 Diamonds",
      description: "Free Fire Diamonds",
      price: 800
    }
  ]);
});

// Create order
app.post("/api/orders", (req, res) => {
  const { uid, region, itemId } = req.body;

  if (!uid || !itemId) {
    return res.status(400).json({
      error: "UID and package are required"
    });
  }

  const orderId = "ORD-" + Date.now();

  res.json({
    success: true,
    orderId,
    uid,
    region,
    itemId,
    status: "pending"
  });
});

// Mark payment submitted
app.post("/api/orders/:id/paid", (req, res) => {
  res.json({
    success: true,
    orderId: req.params.id,
    status: "payment_submitted"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
