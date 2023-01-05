import express from 'express'
import User from './Models/UserModel.js';
import users from './data/user.js';
import  {all ,toppings}  from './data/Product.js';

import Product from './Models/ProductModel.js';
import Toppings from './Models/ToppingModel.js'
import asyncHandler from 'express-async-handler'
// import data dùng để push data lên mongoose bằng .post async bên trong sẽ sử dụng schema mà gọi đến 2 method 1 là deleteMany và insertMany
const ImportData = express.Router()

ImportData.post('/user',asyncHandler(async (req,res)=>{
    await User.deleteMany({})
    const importUser = await User.insertMany(users);
    res.send({importUser})


}))

ImportData.post('/products',asyncHandler(async(req,res)=>{
    await Product.deleteMany({})
    const importProducts = await Product.insertMany(all)
    res.send({importProducts})


}))
ImportData.post('/toppings',asyncHandler(async(req,res)=>{
    await Toppings.deleteMany({})
    const importTopping = await Toppings.insertMany(toppings)
    res.send({importTopping})
}))


export default ImportData