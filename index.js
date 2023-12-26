import express from "express";
import cors from "cors";
import connectDatabase from "./config/mongoDb.js";
import dotenv from "dotenv";
import productRoute from "./Routes/ProductRoutes.js";
import ImportData from "./DataImport.js";
import userRouter from "./Routes/UserRoutes.js";
import orderRouter from "./Routes/orderRoutes.js";
import http from "http";
import momoRouter from "./Routes/MomoRoutes.js";
import swaggerUi from "swagger-ui-express";
import specs from "./swaggerConfig.js";

const app = express();
console.log(connectDatabase);
app.use(express.json());
app.use(cors());
dotenv.config();
connectDatabase();
// web socket
const server = http.createServer(app);
console.log(specs)
// API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/api/import", ImportData);
/**
 * @swagger
 * /api/products:
 *   get:
 *     description: Endpoint to get product data
 *     responses:
 *       '200':
 *         description: Successfully retrieved product data
 */
app.use(
  '/api/products',
  cors({
    origin: ['http://localhost:3000', 'https://www.tickcafentea.com'],
  }),
  productRoute
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     description: Endpoint to get user data
 *     responses:
 *       '200':
 *         description: Successfully retrieved user data
 */
app.use(
  '/api/users',
  cors({
    origin: ['http://localhost:3000', 'https://www.tickcafentea.com'],
  }),
  userRouter
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     description: Endpoint to get order data
 *     responses:
 *       '200':
 *         description: Successfully retrieved order data
 */
app.use(
  '/api/orders',
  cors({
    origin: ['http://localhost:3000', 'https://www.tickcafentea.com'],
  }),
  orderRouter
);

/**
 * @swagger
 * /api/momo:
 *   get:
 *     description: Endpoint to get momo data
 *     responses:
 *       '200':
 *         description: Successfully retrieved momo data
 */
app.use(
  '/api/momo',
  cors({
    origin: ['http://localhost:3000', 'https://www.tickcafentea.com'],
  }),
  momoRouter
);
// app.get("/", (req, res) => {
//   res.send("Api");
// });

const PORT = process.env.PORT || 5000;
server.listen(
  process.env.PORT || 5000,
  console.log(`server is running ${PORT} `)
);
