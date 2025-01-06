import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
///Note -> use await there, where you think execution may takes time.... 



//genearte access & refresh token 
const generateAccessAndRefreshToken = async (userId) => {

  try {
    const user = await User.findById(userId); //get db user, for get its userSchema methods
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()


    user.refreshToken = refreshToken; // we have user object in db model where refresh token field, so here i generate refresh token and put inside user object

    await user.save({ validateBeforeSave: false })  // and save that refresh token while i am going to login, 

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "something went wrong while generating refresh and access token ")
  }

}



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
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] })
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }


  // check is req.files has file path or not (user ne photo upload ki h ki nhi ki)
  const avatarLocatPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path; // this is not good code , let suppose we dont have coverImage on files then value will be undefined and how undefind has [0 index] this may be cause error


  //handle errors more explicitly, you can add a validation check
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocatPath) { // only make avatar required
    throw new ApiError(400, "Avatar flies is required")
  }

  //upload from my server to cloudinery server 
  const avatar = await uploadOnCloudinary(avatarLocatPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) { // if avatar nahi hoga toh DB fatega you know...
    throw new ApiError(400, "Avatar flies is required");
  }

  //create user entry inside DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  })

  //check user is created or not + remove password, refreshToken from DB response, just -(minus) them
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "Something wrong while register");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "user register successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  //req body se Data
  //userName or email
  //find the user
  //password check
  //access and refresh token generate and send
  //send cookies


  //req body se Data
  const { userName, email, password } = req.body;


  //userName or email
  if (!userName && !email) {
    throw new ApiError(400, "username or email is required");
  }

  //Find user
  const user = await User.findOne({
    $or: [{ userName }, { email }] //find user based on userName or email
  })


  if (!user) {
    throw new ApiError(404, "user not exist");
  }

  //password check 
  const ispasswordValid = await user.isPasswordCorrect(password)
  if (!ispasswordValid) {
    throw new ApiError(401, "password incorrect");
  }


  //generate access and refresh tokens and send via cookie
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = { //now cookie is not modify form frontend
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
      },
        "User logged in succefully"
      )
    )
})

const logoutUser = asyncHandler(async (req, res)=>{

  await
   User.findByIdAndUpdate(
    req.user._id, 
    {
    $set: {
      refreshToken: undefined
    }
    }, 
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(
    new ApiResponse(200, {}, "user logged out")
  )



})

export { registerUser, loginUser, logoutUser }