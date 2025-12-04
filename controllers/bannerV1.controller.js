import BannerV1Model from "../models/bannerV1.model.js";
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

// create bannerV1
export async function addBannerV1(req, res) {
  try {
    let bannerV1 = new BannerV1Model({
      bannerTitlename: req.body.bannerTitlename,
      catId: req.body.catId,
      subCatId: req.body.subCatId,
      thirdsubCatId: req.body.thirdsubCatId,
      price: req?.body.price,
      images: imageArr,
      alignInfo: req?.body?.alignInfo,
    });

    if (!bannerV1) {
      res.status(500).json({
        message: "BannerV1 not Created",
        error: true,
        success: false,
      });
    }

    bannerV1 = await bannerV1.save();
    imageArr = [];

    return res.status(200).json({
      message: "BannerV1 Created",
      error: false,
      success: true,
      data: bannerV1,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get bannerV1
export async function getBannerV1(req, res) {
  try {
    const bannerV1 = await BannerV1Model.find();

    if (!bannerV1) {
      res.status(500).json({
        error: false,
        success: true,
        data: "Not found",
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      data: bannerV1,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// // delete main BannerV1
export async function deleteBannerV1(req, res) {
  try {
    const { id } = req.params;

    const bannerV1 = await BannerV1Model.findById(req.params.id);
    const images = bannerV1.images;
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

    // Delete images from Cloudinary
    // for (let img of bannerV1.images) {
    //   const urlArr = img.split("/");
    //   const imageWithExt = urlArr[urlArr.length - 1];
    //   const folder = urlArr[urlArr.length - 2];
    //   const imageName = imageWithExt.split(".")[0];
    //   const publicId = `${folder}/${imageName}`;
    //   await cloudinary.uploader.destroy(publicId);
    // }

    if (!bannerV1) {
      return res.status(404).json({
        message: "Banner not found",
        error: true,
        success: false,
      });
    }

    // for (let img of bannerV1.images) {
    //   const urlArr = img.split("/");

    //   // Remove domain + 'upload' + version number
    //   const startIndex = urlArr.findIndex((part) => part === "upload") + 1;
    //   const publicIdWithExt = urlArr.slice(startIndex).join("/"); // e.g. banners/my_image.jpg
    //   const publicId = publicIdWithExt.substring(
    //     0,
    //     publicIdWithExt.lastIndexOf(".")
    //   ); // e.g. banners/my_image

    //   await cloudinary.uploader.destroy(publicId);
    // }

    // Delete the main banner
    const deletedBanner = await BannerV1Model.findByIdAndDelete(req.params.id);

    if (!deletedBanner) {
      return res.status(400).json({
        message: "Banner not deleted",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Banner deleted successfully!",
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

// Updaate BannerV1
export async function updateBannerV1(req, res) {
  try {
    const bannerV1 = await BannerV1Model.findByIdAndUpdate(
      req.params.id,
      {
        images: imageArr.length > 0 ? imageArr[0] : req.body.images,
        bannerTitlename: req.body.bannerTitlename,
        catId: req.body.catId,
        subCatId: req.body.subCatId,
        thirdsubCatId: req.body.thirdsubCatId,
        price: req?.body.price,
        alignInfo: req?.body?.alignInfo,
      },
      { new: true }
    );

    if (!bannerV1) {
      return res.status(500).json({
        message: "Banner can not be updated",
        error: true,
        success: false,
      });
    }

    res.status(200).json({
      error: false,
      success: true,
      message: "Banner updated successfully",
      data: bannerV1,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
}

// get single bannerV1
export async function getBannersV1(req, res) {
  try {
    const banner = await BannerV1Model.findById(req.params.id);

    if (!banner) {
      res.status(500).json({
        message: "The Banner with the give ID was not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: banner,
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
