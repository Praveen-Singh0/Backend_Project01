import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  //get user details from request (front-end)
  //check validation - field should not empty
  //check user already exist : using "userName, email"
  //check image is uploaded, coz its required field
  //upload images to cloudinary
  //Create user object for store in DB
  //remove password and refresh taken from response
  //check is user created
  //return Response



  // get user Details from request 
  const { userName, fullName, email, password } = req.body;


  // Make them all required field 
  if ([userName, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required")
  }


  // check user is already inside DataBase (User.model is directly talk to database)
  const existedUser = User.findOne({ $or: [{ userName }, { email }] })
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }


  // check is req.files has file path or not (user ne photo upload ki h ki nhi ki)
  const avatarLocatPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocatPath) { // only make avatar required
    throw new ApiError(400, "Avatar flies is required") 
  }

  //upload from my server to cloudinery server 
  const avatar = await uploadOnCloudinary(avatarLocatPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if(!avatar){ // if avatar nahi hoga toh DB fatega you know...
    throw new ApiError(400, "Avatar flies is required");
  }

  //create user entry inside DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    converImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  })

  //check user is created or not + remove password, refreshToken from DB response, just -(minus) them
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if(!createdUser){
    throw new ApiError(500, "Something wrong while register");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user register successfully")
  )

})

export { registerUser }