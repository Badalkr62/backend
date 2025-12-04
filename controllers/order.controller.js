import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// Razorpay
export const createOrderController = async (req, res) => {
  try {
    const order = new OrderModel({
      userId: req.body.userId,
      products: req.body.products,
      totalAmt: req.body.totalAmt,
      paymentId: req.body.paymentId,
      payment_status: req.body.payment_status,
      order_status: req.body.order_status || "pending",
      delivery_address: req.body.delivery_address,

      date: req.body.date,
    });

    console.log("Price", order);

    // Save the order
    const savedOrder = await order.save();

    // Update stock for each product
    for (let i = 0; i < req.body.products.length; i++) {
      const product = await ProductModel.findByIdAndUpdate(
        req.body.products[i].productId
      );
      if (product) {
        product.countInStock -= req.body.products[i].quantity;
        await product.save();
      }
    }

    return res.status(200).json({
      error: false,
      success: true,
      message: "Order Placed",
      data: savedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

// for client order list show
export const getOrderController = async (req, res) => {
  try {
    const userId = req.userId;

    const orderList = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address userId");

    return res.json({
      message: "Order list",
      data: orderList,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

// all order list show in admin with pagination
export const getOrdersController = async (req, res) => {
  try {
    // 🧩 Parse pagination query params
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;

    // 🧩 Count total orders
    const totalOrders = await OrderModel.countDocuments();
    const totalPages = Math.ceil(totalOrders / perPage);

    // 🧩 Handle invalid page number
    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({
        message: "Page not found",
        error: true,
        success: false,
      });
    }

    // 🧩 Fetch paginated orders
    const orderList = await OrderModel.find()
      .sort({ createdAt: -1 })
      .populate("delivery_address userId")
      .skip((page - 1) * perPage)
      .limit(perPage);

    // 🧩 Handle empty list gracefully
    if (!orderList) {
      return res.status(404).json({
        message: "No orders found",
        error: true,
        success: false,
      });
    }

    // ✅ Send well-structured response
    return res.status(200).json({
      message: "All orders (Admin)",
      data: orderList,
      error: false,
      success: true,
      page,
      perPage,
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error("Error in getOrdersController:", error.message);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

// PAYPAL
function getPayPalClient() {
  const environment =
    process.env.PAYPAL_MODE === "live"
      ? new checkoutNodeJssdk.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID_LIVE,
          process.env.PAYPAL_SECRET_LIVE // make sure this is the live secret
        )
      : new checkoutNodeJssdk.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID_TEST,
          process.env.PAYPAL_SECRET_TEST
        );

  return new checkoutNodeJssdk.core.PayPalHttpClient(environment);
}

export const createOrderPaypalController = async (req, res) => {
  try {
    const { totalAmount } = req.query; // get totalAmount from query

    if (!totalAmount) {
      return res.status(500).json({
        error: true,
        success: false,
        message: "totalAmount is required",
      });
    }

    // Create PayPal order request
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: totalAmount,
          },
        },
      ],
    });

    const client = getPayPalClient();

    try {
      const order = await client.execute(request);
      res.json({ id: order.result.id });
    } catch (error) {
      console.error("PayPal create order error:", error);
      res.status(500).json({
        error: true,
        success: false,
        message: "Error creating PayPal order",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

export const captureOrderPaypalController = async (req, res) => {
  try {
    const { paymentId, userId, products, delivery_address, totalAmt, date } =
      req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "paymentId is required",
      });
    }

    // Create capture request
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(
      paymentId
    );
    request.requestBody({});

    const client = getPayPalClient();
    const capture = await client.execute(request);

    // Save order in MongoDB
    const orderInfo = {
      userId,
      products,
      paymentId,
      payment_status: "COMPLETED",
      delivery_address,
      totalAmt,
      date,
    };

    const order = new OrderModel(orderInfo);
    await order.save();

    // Update stock
    for (let i = 0; i < products.length; i++) {
      await ProductModel.findByIdAndUpdate(
        products[i].productId,
        {
          $inc: { countInStock: -parseInt(products[i].quantity) },
        },
        { new: true }
      );
    }

    return res.json({
      success: true,
      error: false,
      order,
      paypalCapture: capture.result,
    });
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // get id from URL
    const { order_status } = req.body; // get new status from body

    console.log("Updating order:", id, "to status:", order_status);

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { order_status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
        error: true,
      });
    }

    return res.json({
      message: "Order Status Updated",
      success: true,
      error: false,
      data: { updatedOrder },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

// ************************ grap / chart working
// totalSales

export const totalSalesController = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const ordersList = await OrderModel.find();

    let totalSales = 0;

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    // initialize
    let monthlySales = months.map((m) => ({ name: m, TotalSales: 0 }));

    // loop orders
    ordersList.forEach((order) => {
      const date = new Date(order.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-based (0 = Jan)

      if (year === currentYear) {
        const amt = parseFloat(order.totalAmt || 0);
        totalSales += amt;
        monthlySales[month].TotalSales += amt;
      }
    });

    return res.status(200).json({
      totalSales,
      monthlySales,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error in totalSalesController:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

export const totalUserController = async (req, res) => {
  try {
    const users = await UserModel.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    const monthlyUsers = months.map((monthName, index) => {
      const monthData = users.find((u) => u._id.month === index + 1);
      return {
        name: monthName,
        TotalUsers: monthData ? monthData.count : 0,
      };
    });

    // ✅ Define TotalUsers properly
    const TotalUsers = users.reduce((sum, u) => sum + u.count, 0);

    return res.status(200).json({
      TotalUsers,
      monthlyUsers,
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error in totalUserController:", error);
    return res.status(500).json({
      error: true,
      success: false,
      message: error.message,
    });
  }
};

// ✅ Server-side search + pagination

export async function getAllOrders(req, res) {
  try {
    const { search = "", page = 1, perPage = 5 } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          // _id exact match (ObjectId)
          { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
          // string fields
          { paymentId: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },

          // numeric fields as string
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$phone" },
                regex: search,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$pincode" },
                regex: search,
                options: "i",
              },
            },
          },

          // userId as string
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$userId" },
                regex: search,
                options: "i",
              },
            },
          },

          // search in createdAt date
          {
            $expr: {
              $regexMatch: {
                input: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                regex: search,
                options: "i",
              },
            },
          },
        ],
      };
    }

    const skip = (page - 1) * parseInt(perPage);
    const limit = parseInt(perPage);

    const totalPosts = await OrderModel.countDocuments(query);

    const orders = await OrderModel.find(query)
      .populate("userId delivery_address")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      error: false,
      data: orders,
      totalPosts,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
}


