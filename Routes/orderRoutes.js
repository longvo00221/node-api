import express from "express";
import asyncHandler from "express-async-handler";
import cors from "cors";
import protect, { admin } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import rateLimit from 'express-rate-limit'
import nodemailer from "nodemailer";
const orderRouter = express.Router();
const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  service: "gmail",
  auth: {
    user: "tickcafetea@gmail.com",
    pass: "ixnvyeglkyhkamen",
  },
});
async function sendEmailOrderBill(email) {
  const message = {
    from: "tickcafetea@gmail.com",
    to: email,
    subject: "Verification Account",
  };
}
// CREATE ORDER
let invoiceCodeCounter = 0;

setInterval(() => {
  invoiceCodeCounter = 0;
}, 86400000);

orderRouter.post(
  "/",
  cors({
    origin: "*"
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message: "Too many login attempts from this IP, please try again later"
  }),
  protect,
  asyncHandler(async (req, res) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
      return;
    } else {
      invoiceCodeCounter++;
      const invoiceCode = `HDTICK-${invoiceCodeCounter.toString().padStart(4, "0")}`;
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
        invoiceCode,
      });

      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);

// ADMIN GET ORDER
orderRouter.get(
  "/all",
  cors({
  origin: '*'
}),
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .populate("user", "id name email");
    res.json(orders);
  })
);

// USER LOGIN ORDERS
orderRouter.get(
  "/",
  cors({
  origin: '*'
}),
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).sort({ _id: -1 });
    res.json(order);
  })
);

// GET ORDER BY ID
orderRouter.get(
  "/:id",
  cors({
  origin: '*'
}),
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

// ORDER IS PAID
orderRouter.put(
  "/:id/pay",
  cors({
  origin: '*'
}),
  protect,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order Not Found");
    }
  })
);

export default orderRouter;
