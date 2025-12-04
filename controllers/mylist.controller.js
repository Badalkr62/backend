import MyListModel from "../models/myList.model.js";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret, // Click 'View API Keys' above to copy your API secret
});

// image Upload
// export async function MyListImage(req, res) {
//     try {

//         const imageArr = [];
//         const userId = req.userId;
//         const images = req.files;

//         const user = await MyListModel.findById(userId);
//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User not found ",
//                 error: true
//             });
//         }
//         // first remove image from cloudinary
//         const imgUrl = user.avatar;

//         const urlArr = imgUrl.split("/")
//         const avatar_image = urlArr[urlArr.length - 1];

//         const imageName = avatar_image.split(".")[0];

//         if (imageName) {
//             const res = await cloudinary.uploader.destroy(
//                 imageName,
//                 (error, result) => {
//                     // console.log(error, res)
//                 }
//             );
//         }

//         const options = {
//             use_filename: true,
//             unique_filename: false,
//             overwrite: false,
//         };

//         for (let i = 0; i < images.length; i++) {

//             const img = await cloudinary.uploader.upload(
//                 images[i].path,
//                 options,
//                 function (error, result) {
//                     imageArr.push(result.secure_url);
//                     fs.unlinkSync(`uploads/${req.files[i].filename}`);
//                 }
//             );

//         }

//         // save in db
//         user.avatar = imageArr[0];
//         await user.save();

//         return res.status(200).json({
//             _id: userId,
//             avatar: imageArr[0],
//             success: true,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false,
//         })
//     }
// }

// add to My list
export async function addToMyListController(req, res) {
  try {
    const userId = req.userId; // middelware
    const {
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      brand,
      discount,
    } = req.body;

    const item = await MyListModel.findOne({
      userId: userId,
      productId: productId,
    });

    if (item) {
      return res.status(404).json({
        message: "Item Already on my List",
      });
    }

    const myList = new MyListModel({
      productId,
      productTitle,
      image,
      rating,
      price,
      oldPrice,
      discount,
      brand,
      userId,
    });

    const save = await myList.save();

    return res.status(200).json({
      error: false,
      success: true,
      message: "The Product added in my list",
      data: myList,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// delete from my list
export async function deleteToMyListController(req, res) {
  try {
    const id = req.params.id;
    console.log(id);

    const myListItem = await MyListModel.findById(id);

    if (!myListItem) {
      return res.status(404).json({
        message: "Item not found in My List from this id",
        error: true,
        success: false,
      });
    }

    const deleteItem = await MyListModel.findByIdAndDelete(id);

    if (!deleteItem) {
      return res.status(404).json({
        message: "The Item is not deleted from list",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "The item removed from my List!",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get my list item
export async function getMyListController(req, res) {
  try {
    const userId = req.userId; // middleware

    const myListItems = await MyListModel.find({
      userId: userId,
    });

    return res.status(200).json({
      data: myListItems,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
