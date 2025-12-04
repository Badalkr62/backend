import { Router } from "express";
import {
  registerUserController,
  logoutUserController,
  verifyEmailController,
  loginUserController,
  userAvatarController,
  removeImageFromCloudinary,
  updateUserDetails,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
  refreshToken,
  userDetails,
  authWithGoogleController,
  addReview,
  getReview,
  getAllUsers,
  getAllReview,
  deleteMultipleUsers,
} from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRoute = Router();
// register
userRoute.post("/register", registerUserController);
// verifyEmail
userRoute.post("/verifyEmail", verifyEmailController);
//login
userRoute.post("/login", loginUserController);
// login with google
userRoute.post("/authWithGoogle", authWithGoogleController);
//logout
userRoute.get("/logout", auth, logoutUserController);
//upload images
userRoute.put(
  "/user-avatar",
  auth,
  upload.array("avatar"),
  userAvatarController
);
//delete images
userRoute.delete("/deleteImage", auth, removeImageFromCloudinary);
// update user
userRoute.put("/:id", auth, updateUserDetails);
// forgot Password
userRoute.post("/forgot-password", forgotPassword);
// verify-forgot-password-otp
userRoute.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);
// reste password verify
userRoute.post("/reset-password", resetPassword);
// refresh token
userRoute.post("/refresh-token", refreshToken);
// User Datails
userRoute.get("/user-details", auth, userDetails);
// *********************
// add reviews
userRoute.post("/addReview", auth, addReview);
// get Reviews
userRoute.get("/getReview", getReview);
userRoute.get("/getAllUsers", getAllUsers);
userRoute.get("/getAllreviews", getAllReview);
userRoute.delete("/delete-multiple", auth, deleteMultipleUsers);

export default userRoute;
