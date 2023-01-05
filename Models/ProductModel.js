import mongoose from "mongoose"
import Toppings from './ToppingModel.js'
const reviewSchema = mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    comment:{
        type:String,
        require:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"User"
    }
})
const  productSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true,
        unique:true,
    },
    nameId:{
        type:String,
        require:true,
    },
    image:{
        type:String,
        require:true,
        
    },
    price:{
        type:Number,
        require:true,
        default:0,

    },
    countInStock:{
        type:Number,
        required:true,
        default:0,
    },
    toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topping" }],
    reviews:[reviewSchema]

},
{
    timestamps:true
}
)
const Product = mongoose.model("Product",productSchema)
export default Product