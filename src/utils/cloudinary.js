import { AsyncLocalStorage } from "async_hooks";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    })
    // console.log("file uploaded on cloudinary", response.url)
    fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlink(localFilePath) // if any error during upload then remove that cruppted file form my local
    return null;
  }

}

export {uploadOnCloudinary}