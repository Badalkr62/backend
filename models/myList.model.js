import mongoose from "mongoose";

const myListSchema = new mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const MyListModel = mongoose.model("MyList", myListSchema);
export default MyListModel;
