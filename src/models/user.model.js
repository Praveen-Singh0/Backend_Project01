import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String, // Cloudeinary url
      required: true
    },
    coverImage: {
      type: String // Cloudeinary url
    },
    watchHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Video"
    }],
    password: {
      type: String,
      required: [true, 'passowrd is required']
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
)

//this is a middlewere (before the data save inside database password will be encrypt).
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) return next(); // and only when password will modified, now every time.
  this.password = bcrypt.hash(this.password, 10)
  next()
})

//now here we check the password is correct at the time dcrypt..
userSchema.methods.isPasswordCorrect = async function (passowrd) {
  return await bcrypt.compare(passowrd, this.passowrd)
}


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {  //1st JWT Need Payload (Data)
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      userName: this.userName,
    },
    process.env.ACCESS_TOKEN_SECRET, //2nd JWT need your Access token
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // 3rd JWT need your token expiry

  )
}
 
userSchema.methods.generateRefreshToken = function () {
  jwt.sign(
    { //1st JWT Need Payload (Data) only ID
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, //2nd JWT need your refresh token
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY} // 3rd JWT need your expiry token expiry. 
  )
}


export const User = mongoose.model('User', userSchema);