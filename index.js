import express from "express";
import cors from "cors";
import connectDatabase from "./config/mongoDb.js";
import dotenv from "dotenv";
import productRoute from "./Routes/ProductRoutes.js";
import ImportData from "./DataImport.js";
import userRouter from "./Routes/UserRoutes.js";
import orderRouter from "./Routes/orderRoutes.js";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import redis from "redis";
import momoRouter from "./Routes/MomoRoutes.js";
import path from "path";

import Pusher from "pusher";
const app = express();
console.log(connectDatabase);
app.use(express.json());
app.use(cors());
dotenv.config();
connectDatabase();
// web socket
const server = http.createServer(app);

// API
app.use("/api/import", ImportData);
app.use(
  "/api/products",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
  }),
  productRoute
);

app.use(
  "/api/users",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
  }),
  userRouter
);
app.use(
  "/api/orders",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
  }),
  orderRouter
);
app.use(
  "/api/momo",
  cors({
    origin: ["http://localhost:3000", "https://www.tickcafentea.com"],
  }),
  momoRouter
);

app.get("/", (req, res) => {
  res.send("Api");
});

const PORT = process.env.PORT || 5000;
server.listen(
  process.env.PORT || 5000,
  console.log(`server is running ${PORT} `)
);
