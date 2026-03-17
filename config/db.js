import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database is active")

    } catch (error) {
        console.error("Database connection failed:", error.message)
        process.exit(1)
    }
}

export default connectDB
