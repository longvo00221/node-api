import mongoose from "mongoose"

const  toppingSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    value:{
        type:String,
        required:true
    },
    label:{
        type:String,
        required:true
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
  

},
{
    timestamps:true
}
)
const Toppings = mongoose.model("Toppings",toppingSchema)
export default Toppings