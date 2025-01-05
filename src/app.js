import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: process.env.CORD_ORIGIN,
  credentials: true   
}))

app.get("/", (req, res)=>{
  res.send("HEY")
})

//middleware
app.use(express.json({limit : '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import 
import userRouter from "./routes/user.routes.js";

//routes declaration 
app.use("/api/v1/users", userRouter)
//http://localhost:8000/api/v1/users/register     --> your route will look like this  


export {app}