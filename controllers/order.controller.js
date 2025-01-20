const productController = require("./product.controller");
const {randomStringGenerator} = require("../utils/randomStringGenerator")
const Order = require("../models/Order");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;

    const insufficientStockItem = await productController.checkItemListStock(
      orderList
    );

    if (insufficientStockItem.length > 0) {
      const errorMessage = insufficientStockItem.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum:randomStringGenerator()
    });

    await newOrder.save();
    res.status(200).json({status:"success", orderNum:newOrder.orderNum})
  } catch (error) {
    res.status(400).json({status:"fail", error: error.message})
  }
};

module.exports = orderController;
