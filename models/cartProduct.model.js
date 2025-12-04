import mongoose from "mongoose";

const cartProductSchema = mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    rating: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
    },
    size: {
      type: String,
    },
    weight: {
      type: String,
    },
    ram: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CartProductModel = mongoose.model("cart", cartProductSchema);

export default CartProductModel;
