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
import redis from 'redis'
import momoRouter from "./Routes/MomoRoutes.js";
import path from "path";

import Pusher from "pusher";
const app = express();
console.log(connectDatabase);
app.use(express.json());
app.use(cors())
dotenv.config();
connectDatabase();
// web socket
const server = http.createServer(app);
const client = redis.createClient()
const wss = new WebSocketServer({server:server})
wss.on("connection",function connection(ws) {
    console.log(`New Connect From Client`)
    // ws.send("Hello new Client")
    ws.on("message", function incoming(message){
        console.log("received : %s ", message)
        wss.clients.forEach(function each(client) {
            if(client !== ws && client.readyState === WebSocket.OPEN){
                client.send(`${message} `, JSON.stringify(message))
            }
        })

    })
})
//PUSHER

const pusher = new Pusher({
  appId: process.env.APP_ID_PUSHER,
  key: process.env.KEY_PUSHER,
  secret: process.env.SERECT_PUSHER,
  cluster: process.env.CLUSTER_PUSHER,

  useTLS: true
});
app.post('/send-event', (req, res) => {
  pusher.trigger('orders', 'admin-new-order', {
    message: `Đơn Đặt Hàng Mới Từ ${req.body.name}!`
  });
  res.sendStatus(200);
});



// API
app.use("/api/import", ImportData);
app.use("/api/products", cors({
  origin: '*'
}), productRoute);

app.use("/api/users", cors({
  origin: '*'
}), userRouter);
app.use("/api/orders", cors({
  origin: '*'
}), orderRouter);
app.use('/api/momo',cors({
  origin: '*'
}),momoRouter)

app.get("/", (req, res) => {
  res.send("Api");
});

const PORT = process.env.PORT || 5000;
server.listen(process.env.PORT || 5000, console.log(`server is running ${PORT} `));

