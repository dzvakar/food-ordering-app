const express = require("express");
const Order = require("../models/Order");

const router = express.Router();

// READ all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE order
router.post("/", async (req, res) => {
  try {
    const { customerName, phone, address, items, totalAmount } = req.body;

    if (!customerName || !phone || !address || !items?.length) {
      return res.status(400).json({ message: "Customer details and at least one item are required" });
    }

    const order = await Order.create({
      customerName,
      phone,
      address,
      items,
      totalAmount
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE order status/details
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;