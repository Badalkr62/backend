// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//     },
//     products: [
//       {
//         productId: {
//           type: String,
//         },
//         productTitle: {
//           name: String,
//         },
//         quantity: {
//           type: Number,
//         },
//         price: {
//           type: Number,
//         },
//         image: {
//           type: String,
//         },
//         subTotal: {
//           type: Number,
//         },
//       },
//     ],
//     paymentId: {
//       type: String,
//       default: "",
//     },
//     payment_status: {
//       type: String,
//       default: "",
//     },
//     order_status: {
//       type: String,
//       default: "pending",
//     },
//     delivery_address: {
//       type: mongoose.Schema.ObjectId,
//       ref: "address",
//     },
//     totalAmt: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// const OrderModel = mongoose.model("order", orderSchema);

// export default OrderModel;

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: String,
        },
        images: [
          {
            type: String,
            required: true,
          },
        ],
        productTitle: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        subTotal: {
          type: Number,
          required: true,
        },
      },
    ],
    paymentId: {
      type: String,
      default: "",
    },
    payment_status: {
      type: String,
      default: "",
    },
    order_status: {
      type: String,
      default: "pending",
    },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
      required: true,
    },
    totalAmt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;
