import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRoute from "./route/user.route.js";
import categoryRoute from "./route/category.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import myListRouter from "./route/mylist.route.js";
import addressRouter from "./route/address.route.js";
import homeSlidesRouter from "./route/homeSlides.route.js";
import bannerV1Route from "./route/bannerV1.route.js";
import blogRoute from "./route/blog.route.js";
import orderRouter from "./route/order.route.js";
import bannerV2Route from "./route/bannerV2.route.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const PORT = process.env.PORT || 8080;

app.post("/", (req, res) => {
  res.json({
    message: "server is running on port " + PORT,
  });
});

app.use("/api/user", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/myList", myListRouter);
app.use("/api/address", addressRouter);
app.use("/api/homeSlides", homeSlidesRouter);
app.use("/api/bannerV1", bannerV1Route);
app.use("/api/blog", blogRoute);
app.use("/api/order", orderRouter);
app.use("/api/bannerV2", bannerV2Route);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at ${PORT}`);
  });
});
