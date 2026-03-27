import mongoose from "mongoose";



export const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://Amit_admin:Amit4321@cluster0.6qzxh70.mongodb.net/varcel");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit the process with failure
    }
}