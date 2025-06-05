import mongoose from 'mongoose';

const connectDb = async () =>{
    try{
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`MongoDb connected: ${connect.connection.host}`);
        console.log(`Database Name: ${connect.connection.name}`);
    }
    catch(error){
        console.log("Error connecting database :",error);
        process.exit(1);
    }
};

export default connectDb;