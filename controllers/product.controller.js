const Product = require("../models/Product");

const productController = {};
// const PAGE_SIZE = 3;

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });

    await product.save();
    res.status(200).json({ status: "success", product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// productController.getProducts = async (req, res) => {
//   try {
//     const products = await Product.find({})
//     res.status(200).json({ status: "success", data : products });
//   } catch (error) {
//     res.status(400).json({ status: "fail", error: error.message });
//   }
// };

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    const totalItemNum = await Product.find(cond).countDocuments();
    let query = Product.find(cond);

    // const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

    // if (page) {
    //   query = query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
    // }

    const productList = await query.exec();

    res.status(200).json({
      status: "success",
      // totalPageNum,
      data: productList,
    });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;
    const product = await Product.findByIdAndUpdate(
      { id: productId },
      { sku, name, size, image, category, description, price, stock, status },
      {new:true}
    );
    if(!product) throw new Error("item doesn't exist")
    res.status(200).json({ status: "success", data:product });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.checkStock= async (item)=>{
  const product = await Product.findById(item.productId)
  if(product.stock[item.size] <item.qty ){
    return {isVerify:false, message: `${product.name}의 ${item.size}재고가 부족합니다.`}
  }

  const newStock = {...product.stock}
  newStock[item.size] -= item.qty
  product.stock=newStock

  await product.save()

  return {isVerify:true}
}

productController.checkItemListStock=async(itemList)=>{
  const insufficientStockItems = []

  await Promise.all(
    itemList.map(async (item)=>{
      const stockCheck = await productController.checkStock(item)
      if(!stockCheck.isVerify){
        insufficientStockItems.push({item, message:stockCheck, message})
      }
      return stockCheck
    })
  )
  
  return insufficientStockItems;
  
}

module.exports = productController;
