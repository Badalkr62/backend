import BlogModel from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret, // Click 'View API Keys' above to copy your API secret
});

// image Upload
var imageArr = [];
export async function uploadImages(req, res) {
  try {
    imageArr = [];
    const images = req.files;

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(
        images[i].path,
        options,
        function (error, result) {
          imageArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    return res.status(200).json({
      images: imageArr,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// create blog
export async function addBlog(req, res) {
  try {
    let blog = new BlogModel({
      title: req?.body?.title,
      description: req?.body?.description,
      images: imageArr,
    });

    if (!blog) {
      res.status(500).json({
        message: "Blog not Created",
        error: true,
        success: false,
      });
    }

    blog = await blog.save();
    imageArr = [];

    return res.status(200).json({
      message: "Blog Created",
      error: false,
      success: true,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get blog
export async function getBlog(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalPosts = await BlogModel.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    const blog = await BlogModel.find()
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!blog) {
      res.status(500).json({
        error: false,
        success: true,
        data: "Blog Not found",
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      data: blog,
      totalPages: totalPages,
      page: page,
      totalPosts: totalPosts,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// // delete main blog
export async function deleteBlog(req, res) {
  try {
    const { id } = req.params;

    const blog = await BlogModel.findById(req.params.id);
    const images = blog.images;
    let img = " ";

    // Delete images from Cloudinary
    for (img of images) {
      const imgUrl = img;
      const urlArr = img.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];

      if (imageName) {
        cloudinary.uploader.destroy(imageName, (error, result) => {
          // console.log(err, result)
        });
      }
    }

    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        error: true,
        success: false,
      });
    }

    // Delete the main blog
    const deletedBlog = await BlogModel.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(400).json({
        message: "Blog not deleted",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Blog deleted successfully!",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// Updaate Blog
export async function updateBlog(req, res) {
  try {
    const blog = await BlogModel.findByIdAndUpdate(
      req.params.id,
      {
        images: imageArr.length > 0 ? imageArr[0] : req.body.images,
        title: req?.body?.title,
        description: req?.body?.description,
      },
      { new: true }
    );

    if (!blog) {
      return res.status(500).json({
        message: "Blog can not be updated",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// get single Blog
export async function getBlogs(req, res) {
  try {
    const blog = await BlogModel.findById(req.params.id);

    if (!blog) {
      res.status(500).json({
        message: "The Blog with the give ID was not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// Remove Image
export async function removeImageFromCloudinary(req, res) {
  try {
    const imgUrl = req.query.img;
    if (!imgUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is required" });
    }

    // Split URL and extract public_id
    const urlArr = imgUrl.split("/");
    const imageWithExtension = urlArr[urlArr.length - 1]; // e.g., "1749791204341_Screenshot.png"
    const imageName = imageWithExtension.split(".")[0]; // e.g., "1749791204341_Screenshot"

    // Optional: prepend folder name if applicable
    const folderName = urlArr.includes("upload")
      ? ""
      : urlArr[urlArr.length - 2];
    const publicId = folderName ? `${folderName}/${imageName}` : imageName;

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ success: true, message: "Image deleted successfully", result });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Image deletion failed", result });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
}
