import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import HomeSliderModel from "../models/homeSlider.js";
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
    console.log(images);

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

// add Image Slide
export async function addSlide(req, res) {
  try {
    let slide = new HomeSliderModel({
      images: imageArr,
    });

    if (!slide) {
      res.status(500).json({
        message: "Slide Image not Created",
        error: true,
        success: false,
      });
    }

    slide = await slide.save();
    imageArr = [];

    return res.status(200).json({
      message: "Slide Created ",
      error: false,
      success: true,
      data: slide,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get All Slide
export async function getHomeSlides(req, res) {
  try {
    const slide = await HomeSliderModel.find();

    if (!slide) {
      res.status(404).json({
        message: "Slide Image not Found",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      data: slide,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get single slide
export async function getSlide(req, res) {
  try {
    const slide = await HomeSliderModel.findById(req.params.id);

    if (!slide) {
      res.status(404).json({
        message: "The slide with the give ID was not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: slide,
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

// Updaate slide
export async function updateSlide(req, res) {
  try {
    const slide = await HomeSliderModel.findByIdAndUpdate(
      req.params.id,
      {
        images: imageArr.length > 0 ? imageArr[0] : req.body.images,
      },
      { new: true }
    );

    if (!slide) {
      return res.status(500).json({
        message: "Slide can not be updated",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      message: "Slide updated successfully",
      data: slide,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// delete main slide
export async function deleteSlide(req, res) {
  try {
    const { id } = req.params;

    const slide = await HomeSliderModel.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({
        message: "slide not found",
        error: true,
        success: false,
      });
    }

    // Delete images from Cloudinary
    for (let img of slide.images) {
      const urlArr = img.split("/");
      const imageWithExt = urlArr[urlArr.length - 1];
      const folder = urlArr[urlArr.length - 2];
      const imageName = imageWithExt.split(".")[0];
      const publicId = `${folder}/${imageName}`;
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the main slide
    const deletedSlide = await HomeSliderModel.findByIdAndDelete(req.params.id);

    if (!deletedSlide) {
      return res.status(404).json({
        message: "Slide not found",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "slide deleted successfully!",
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

// delete Multiple Product
export async function deleteMultipleSlide(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    // Delete images from Cloudinary
    for (const id of ids) {
      const slide = await HomeSliderModel.findById(id);
      if (slide && Array.isArray(slide.images)) {
        for (const imgUrl of slide.images) {
          const slideName = imgUrl.split("/").pop().split(".")[0];
          if (slideName) {
            cloudinary.uploader.destroy(slideName);
          }
        }
      }
    }

    await HomeSliderModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Products deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}
