import Request from "../models/Request.js";
import Product from "../models/Product.js";

const checkStatus = async (req, res) => {
  const { request_id } = req.params;
  const request = await Request.findOne({ request_id });

  if (!request)
    return res.status(404).json({ error: "Request with passed ID not found" });

  const products = await Product.find({ request_id });

  res.json({
    request_id,
    status: request.status,
    products: products.map((product) => ({
      product_name: product.product_name,
      input_image_urls: product.input_img_urls,
      output_image_urls: product.output_img_urls,
    })),
  });
};

export default checkStatus;
