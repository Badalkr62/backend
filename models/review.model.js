import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema(
  {
    image: {
      type: [String],
      default: [],
    },

    userName: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: "",
    },
    review: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
    },
    productId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("reviews", reviewsSchema);

export default ReviewModel;
