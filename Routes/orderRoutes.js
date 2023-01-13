import express from "express";
import asyncHandler from "express-async-handler";
import cors from "cors";
import protect, { admin } from "../Middleware/AuthMiddleware.js";
import Order from "./../Models/OrderModel.js";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";
const orderRouter = express.Router();
const currentDate = new Date();
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
async function sendEmailOrderBillAdmin(
  shippingAddress,
  paymentMethod,
  totalPrice
) {
  const message = {
    from: "tickcafetea@gmail.com",
    to: "vlong3589@gmail.com",
    subject: "Order Bill",
    text: `Đơn Hàng Mới Từ ${shippingAddress.name},${shippingAddress.delivery},Số Điện Thoại:${shippingAddress.phone},Địa Chỉ:${shippingAddress.address},Quận:${shippingAddress.ward},Phương Thức Thanh Toán:${paymentMethod},Tổng Tiền:${totalPrice},xem thêm chi tiết tại admin page : https://admin.tickcafetea.com/`,
  };

  await transport.sendMail(message);
}
// CREATE ORDER
let invoiceCodeCounter = 0;

setInterval(() => {
  invoiceCodeCounter = 0;
}, 86400000);

orderRouter.post(
  "/",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 100 requests per windowMs
    message: "Too many login attempts from this IP, please try again later",
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
      const invoiceCode = `HDTICK-${invoiceCodeCounter
        .toString()
        .padStart(4, "0")}`;
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
      try {
        await sendEmailOrderBillAdmin(
          shippingAddress,
          paymentMethod,
          totalPrice
        );
      } catch (error) {
        res.status(500).json({ message: "Error sending verification email" });
        return;
      }
      const createOrder = await order.save();
      res.status(201).json(createOrder);
    }
  })
);

// ADMIN GET ORDER
orderRouter.get(
  "/all",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
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
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
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
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
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
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
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
