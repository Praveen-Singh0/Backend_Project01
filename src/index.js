import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';


import fs from 'fs';
import path from 'path';

const directoryPath = "C:\\Users\\lenovo\\Desktop\\Testing_Backend\\Backend\\src";

// Function to recursively get the directory structure
function getDirectoryStructure(dirPath) {
  const result = {};
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
          result[item] = getDirectoryStructure(itemPath);
      } else {
          result[item] = "file";
      }
  });

  return result;
}
const directoryStructure = getDirectoryStructure(directoryPath);

// console.log(JSON.stringify(directoryStructure, null, 2));

dotenv.config();
    
app.get('/', (req, res) => {
  res.send(JSON.stringify(directoryStructure, null, 2));
});


connectDB().then(()=>{
  app.listen(process.env.PORT || 8000,  ()=>{
    console.log(`server is running at ${process.env.PORT}`)
  })
}).catch(()=>{
  console.log("DB Connection faild !!!");
})