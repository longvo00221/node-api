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
  totalPrice,
  orderItems
) {
  let orderItemsHTML = "";
for (let i = 0; i < orderItems.length; i++) {
  let toppingHTML = "";
    if (orderItems[i].topping) {
      for (let j = 0; j < orderItems[i].topping.length; j++) {
        toppingHTML += `<h5>topping: ${orderItems[i].topping[j].value}</h5>`;
      }
    }
    orderItemsHTML += `
    <div class="product-item">
        <h4>${orderItems[i].name} x${orderItems[i].qty}</h4>
        ${toppingHTML}
    </div>
    `;
  }
  const message = {
    from: "tickcafetea@gmail.com",
    to: "tickcafentea@gmail.com",
    subject: "Order Bill",
    // text: `Đơn Hàng Mới Từ ${shippingAddress.name},${shippingAddress.delivery},Số Điện Thoại:${shippingAddress.phone},Địa Chỉ:${shippingAddress.address},Quận:${shippingAddress.ward},Phương Thức Thanh Toán:${paymentMethod},Tổng Tiền:${totalPrice},xem thêm chi tiết tại admin page : https://admin.tickcafetea.com/`,
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
    >
      <head>
        <meta charset="UTF-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta content="telephone=no" name="format-detection" />
        <title>New email template 2023-01-11</title>
        <style type="text/css">
        .product-item{
          border-bottom: 1px solid #000;
          display: inline-block;
          
        }
        .product-list{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
        }
        .product-inner{
          margin-top:-15px;
        }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Bạn Có Một Đơn Hàng Mới</h1>
          <h2>
            <strong>Khách Hàng : ${shippingAddress.name}</strong>
          </h2>
          <h2>
            <strong>Giao Hàng : ${shippingAddress.delivery},</strong>
          </h2>
          <h2>
            <strong>Số Điện Thoại : ${shippingAddress.phone},</strong>
          </h2>
          <h2>
            <strong>Địa Chỉ : ${shippingAddress.address},${shippingAddress.ward},${shippingAddress.endAddress}</strong>
          </h2>
          <h2>
            <strong>Phương Thức Thanh Toán : ${paymentMethod}</strong>
          </h2>
          <div class="product-list">
            <h2>Danh Sách Sản phẩm:</h2>
                <div class="product-inner">${orderItemsHTML}</div>
          </div>
        </div>
      </body>
    </html>
    `,
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
          totalPrice,
          orderItems
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
