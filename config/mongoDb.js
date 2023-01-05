
import mongoose from "mongoose"
const connectDatabase = async() => {
    try {
        const connection = await mongoose.connect(`mongodb+srv://admin:${process.env.MONGO_URL_PASSWORD}@tickcoffeetea.xoobcjz.mongodb.net/?retryWrites=true&w=majority`, {
            useUnifiedTopology:true,
            useNewUrlParser:true,
        })
        
        console.log("mongo connected")
    } catch (error) {
        console.log(`Error: ${error.mongoose}`)
        process.exit(1)
    }
}

export default connectDatabase