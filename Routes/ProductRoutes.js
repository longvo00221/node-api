import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../Models/ProductModel.js";
import Toppings from "../Models/ToppingModel.js";
import cors from "cors";
import protect, { admin } from "../Middleware/AuthMiddleware.js";
const productRoute = express.Router();

productRoute.get(
  "/",
  cors({
    origin: '*'
  }),
  asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
  ? {
      $or: [
        {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
        {
          normalizedName: {
            $regex: req.query.keyword,
            $options: "i",
          },
        },
      ],
    }
  : {};


    const products = await Product.find({ ...keyword });
    res.json(products);
  })
);
productRoute.get(
  "/topping",
  cors({
    origin: '*'
  }),
  asyncHandler(async (req, res) => {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: "i",
          },
        }
      : {};

    const toppings = await Toppings.find({ ...keyword });
    res.json(toppings);
  })
);
productRoute.get(
  "/:id",
  cors({
    origin: '*'
  }),
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not fount");
    }
  })
);
// DELETE PRODUCT
productRoute.delete(
  "/:id",
  protect,
  cors({
    origin: '*'
  }),
  admin,
  asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: "Delete Product Success!" });
    } else {
      res.status(404);
      throw new Error("Product Not Found");
    }
  })
);
// ADD PRODUCT
productRoute.post(
  "/",
  protect,
  cors({
    origin: '*'
  }),
  admin,
  asyncHandler(async (req, res, next) => {
    const { name, title, nameId, image, price, countInStock } = req.body;
    const producteExist = await Product.findOne({ name });

    if (producteExist) {
      res.status(400);
      throw new Error("Product name already");
    } else {
      const product = new Product({
        name,
        title,
        nameId,
        image,
        price,
        countInStock,
        user: req.user._id,
      });
      if (product) {
        const createProduct = await product.save();
        res.status(201).json(createProduct);
      } else {
        res.status(404);
        throw new Error("Invalid Product Data");
      }
    }
  })
);
// EDIT PRODUCT
productRoute.put(
  "/:id",
  protect,
  admin,
  cors({
    origin: '*'
  }),
  asyncHandler(async (req, res, next) => {
    const { name, title, nameId, image, price, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.title = title || product.title;
      product.nameId = nameId || product.nameId;
      product.image = image || product.image;
      product.price = price || product.price;
      product.countInStock = countInStock || product.countInStock;
      const editProduct = await product.save();
      res.json(editProduct);
    } else {
      res.status(400);
      throw new Error("Product Not Found")
    }
  })
);
export default productRoute;
