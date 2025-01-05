import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

//without this .env.config() my code is running
dotenv.config({
  path: './.env'
})




connectDB().then(()=>{
  app.listen(process.env.PORT || 8000,  ()=>{
    console.log(`server is running at ${process.env.PORT}`)
  })
}).catch(()=>{
  console.log("DB Connection faild !!!");
})