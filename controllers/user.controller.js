import sendEmailFun from "../config/sendEmail.js";
import ForgotPasswordTemplate from "../utils/ForgotPasswordTemplate.js";
import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import VerificationEmail from "../utils/VerificationEmail.js";
import ReviewModel from "../models/review.model.js";
// Configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret, // Click 'View API Keys' above to copy your API secret
});

//  register controller
export async function registerUserController(req, res) {
  try {
    let user;
    const { name, email, password, mobile } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Provide email, name, password",
        error: true,
        success: false,
      });
    }

    user = await UserModel.findOne({ email: email });

    if (user) {
      return res.json({
        message: "User Already Register with this email",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(password, salt);

    user = new UserModel({
      name: name,
      email: email,
      mobile: mobile,
      password: hashPassword,
      otp: verifyCode,
      otpExpires: Date.now() + 600000,
    });

    await user.save();

    // send verification email
    await sendEmailFun({
      to: email,
      subject: "Verify email from Ecommerce App",
      text: "",
      html: VerificationEmail(name, verifyCode),
    });

    // Create a JWT token for verification purpose
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    // Send success response
    return res.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully! please verify your email.",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// verify Email controller
export async function verifyEmailController(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found ", error: true });
    }

    // const isCodeValid = user.otp === otp;
    const isCodeValid = String(user.otp).trim() === String(otp).trim();
    const isNotExpired = user.otpExpires > Date.now();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        error: false,
      });
    } else if (!isCodeValid) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid OTP",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "OTP Expired",
        error: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
      error: true,
    });
  }
}

// //  register controller By Google
export async function authWithGoogleController(req, res) {
  try {
    // let user;
    const { name, email, password, mobile, avatar, role, signUpWithGoogle } =
      req.body;

    const existingUser = await UserModel.findOne({ email: email });

    if (!existingUser) {
      const user = await UserModel.create({
        name: name,
        mobile: mobile,
        email: email,
        password: "null",
        avatar: avatar,
        role: role,
        verify_email: true,
        signUpWithGoogle: true,
      });

      await user.save();

      const accessToken = await generatedAccessToken(user._id);
      const refreshToken = await generatedRefreshToken(user._id);

      await UserModel.findByIdAndUpdate(user._id, {
        last_login_date: new Date(),
      });

      const cookiesOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      res.cookie("accessToken", accessToken, cookiesOptions);
      res.cookie("refreshToken", refreshToken, cookiesOptions);

      // Send success response
      return res.status(200).json({
        success: true,
        error: false,
        message: "Login successfully",
        data: {
          accessToken,
          refreshToken,
        },
      });
    } else {
      const accessToken = await generatedAccessToken(existingUser._id);
      const refreshToken = await generatedRefreshToken(existingUser._id);

      await UserModel.findByIdAndUpdate(existingUser._id, {
        last_login_date: new Date(),
      });

      const cookiesOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
      };

      res.cookie("accessToken", accessToken, cookiesOptions);
      res.cookie("refreshToken", refreshToken, cookiesOptions);

      // Send success response
      return res.status(200).json({
        success: true,
        error: false,
        message: "Login successfully",
        data: {
          accessToken,
          refreshToken,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// login controller
export async function loginUserController(req, res) {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not Register",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contact to Admin",
        error: true,
        success: false,
      });
    }

    if (user.verify_email !== true) {
      return res.status(400).json({
        message: "Your email is not verify yet please verify your email first",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    await UserModel.findByIdAndUpdate(user._id, {
      last_login_date: new Date(),
    });

    const cookiesOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", accessToken, cookiesOptions);
    res.cookie("refreshToken", refreshToken, cookiesOptions);

    return res.json({
      message: "Login successfully",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login Error", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// logout controller
export async function logoutUserController(req, res) {
  try {
    const userId = req.userId; // set by middleware

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    // Clear cookies
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    // Await DB update to remove refresh token
    await UserModel.findByIdAndUpdate(userId, {
      refresh_token: "",
    });

    return res.json({
      message: "Logout successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal server error",
      error: true,
      success: false,
    });
  }
}

// image Upload
export async function userAvatarController(req, res) {
  try {
    const imageArr = [];
    const userId = req.userId;
    const images = req.files;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found ",
        error: true,
      });
    }
    // first remove image from cloudinary
    const imgUrl = user.avatar;

    const urlArr = imgUrl.split("/");
    const avatar_image = urlArr[urlArr.length - 1];

    const imageName = avatar_image.split(".")[0];

    if (imageName) {
      const res = await cloudinary.uploader.destroy(
        imageName,
        (error, result) => {
          // console.log(error, res)
        }
      );
    }

    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
    };

    for (let i = 0; i < images.length; i++) {
      const img = await cloudinary.uploader.upload(
        images[i].path,
        options,
        function (error, result) {
          imageArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    // save in db
    user.avatar = imageArr[0];
    await user.save();

    return res.status(200).json({
      _id: userId,
      avatar: imageArr[0],
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

// update user detials
export async function updateUserDetails(req, res) {
  try {
    const userId = req.userId; // auth middleware
    const { name, email, mobile } = req.body;

    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return res.status(400).json({
        success: false,
        message: "The User can not be Updated!",
        error: true,
      });
    }

    // store new data of User
    const updateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        name: name,
        mobile: mobile,
        email: email,
      },
      { new: true }
    );

    // Send verification email
    if (email !== userExist.email) {
      await sendEmailFun(
        {
          to: email,
          subject: "Verify email from Ecommerce App",
          text: "",
          html: VerificationEmail(name, verifyCode),
        },
        { new: true }
      );
    }

    return res.json({
      message: "User Updated Successfully",
      success: true,
      error: false,
      user: {
        name: updateUser?.name,
        _id: updateUser?._id,
        email: updateUser?.email,
        mobile: updateUser?.mobile,
        avatar: updateUser?.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// forgot password
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = verifyCode;
    user.otpExpires = Date.now() + 600000;
    await user.save();

    await sendEmailFun({
      to: email,
      subject: "Your OTP for password reset - Ecommerce App",
      text: "",
      html: ForgotPasswordTemplate(user.name, verifyCode),
    });

    return res.json({
      message: "Check your email",
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

// verifyForgotOTP
export async function verifyForgotPasswordOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not available",
        error: true,
        success: false,
      });
    }

    if (!email || !otp) {
      return res.status(400).json({
        message: "Provide required field email, otp",
        error: true,
        success: false,
      });
    }

    if (otp !== user.otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString();

    if (user.otpExpires < currentTime) {
      return res.status(400).json({
        message: "OTP is Expired",
        error: true,
        success: false,
      });
    }

    user.otp = "";
    user.otpExpires = "";

    await user.save();

    return res.status(200).json({
      message: "Verify OTP successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}

// reset password
export async function resetPassword(req, res) {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "provide required fields email, newPassword, confirmPassword",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email is not Available",
        error: true,
        success: false,
      });
    }

    if (user?.signUpWithGoogle === false) {
      // If oldPassword is provided (from account settings), verify it
      if (oldPassword) {
        const checkPassword = await bcryptjs.compare(
          oldPassword,
          user.password
        );
        if (!checkPassword) {
          return res.status(400).json({
            message: "Your old password is wrong",
            error: true,
            success: false,
          });
        }
      }
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "NewPassword and confirmPassword must be same",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(confirmPassword, salt);

    user.password = hashPassword;
    user.signUpWithGoogle = false;
    await user.save();

    return res.status(200).json({
      message: "Password Updated Successfully",
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

// refresh token controler
export async function refreshToken(req, res) {
  try {
    const refreshToken =
      req.cookies.refreshToken || req.header.authorization.split(" ")[1]; // [Bearer token]

    if (!refreshToken) {
      return res.status(400).json({
        message: "Invalid token",
        error: true,
        success: false,
      });
    }

    const verifyToken = await jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    if (!verifyToken) {
      return res.status(400).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = verifyToken._id;
    const newAccessToken = await generatedAccessToken(userId);

    const cookiesOption = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    res.cookie("accessToken", newAccessToken, cookiesOption);

    return res.status(400).json({
      message: "New Access token generated",
      error: false,
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

// get login user details
// export async function userDetails(req, res) {
//   try {
//     const userId = req.userId;

//     const user = await UserModel.findById(userId)
//     .select("-password -refresh_token"
//     );

//     return res.json({
//       message: "User Details",
//       data: user,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something is wrong",
//       error: true,
//       success: false,
//     });
//   }
// }
// get login user details
export async function userDetails(req, res) {
  try {
    const userId = req.userId;

    const user = await UserModel.findById(userId)
      .select("-password -refresh_token") // exclude sensitive fields
      .populate("address_details"); // populate full address objects

    return res.json({
      message: "User Details",
      data: user,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// *****************************************************
// Review controllers
// add review
export async function addReview(req, res) {
  try {
    const { image, userName, rating, review, userId, productId } = req.body;
    const userReview = new ReviewModel({
      image: image,
      rating: rating,
      userName: userName,
      review: review,
      userId: userId,
      productId: productId,
    });

    await userReview.save();

    return res.status(200).json({
      success: true,
      error: false,
      data: userReview,
      message: "Review added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something is wrong",
      error: true,
      success: false,
    });
  }
}

// get reviews
// export async function getReview(req, res) {
//   try {
//     const productId = req.query.productId;

//     const reviews = ReviewModel.findOne({ productId: productId });

//     if (!reviews) {
//       return res.status(400).json({
//         error: true,
//         success: false,
//       });
//     }

//     return res.status(200).json({
//       error: false,
//       success: true,
//       data: reviews,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something is wrong",
//       error: true,
//       success: false,
//     });
//   }
// }

export async function getReview(req, res) {
  try {
    const { productId } = req.query;

    const reviews = await ReviewModel.find({ productId: productId });

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        error: true,
        success: false,
        message: "No reviews found for this product",
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("getReview error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}

// get all user
// export async function getAllUsers(req, res) {
//   try {
//     const users = await UserModel.find();
//       console.log("Users fetched:", users?.length);

//     if (!users) {
//       return res.status(400).json({
//         error: true,
//         success: false,
//       });
//     }

//     return res.status(200).json({
//       error: false,
//       success: true,
//       data: users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Something went wrong",
//       error: true,
//       success: false,
//     });
//   }
// }

// controllers/userController.js
export async function getAllUsers(req, res) {
  try {
    // Get page & limit from query params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalUsers = await UserModel.countDocuments();
    const users = await UserModel.find()
      .sort({ createdAt: -1 }) // latest users first
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      error: false,
      success: true,
      data: users,
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}

// delete Multiple Users
export async function deleteMultipleUsers(req, res) {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: true,
        success: false,
        message: "Invalid input. Expected array of IDs.",
      });
    }

    // Delete avatar images from Cloudinary
    for (const id of ids) {
      const user = await UserModel.findById(id);
      if (user && user.avatar) {
        const imageName = user.avatar.split("/").pop().split(".")[0];
        if (imageName) {
          await cloudinary.uploader.destroy(imageName);
        }
      }
    }

    // Delete users from the database
    await UserModel.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      error: false,
      message: "Users deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting multiple users:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message || "Server error during deletion",
    });
  }
}

// get all review
export async function getAllReview(req, res) {
  try {
    const reviews = await ReviewModel.find();

    if (!reviews) {
      return res.status(400).json({
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
}
