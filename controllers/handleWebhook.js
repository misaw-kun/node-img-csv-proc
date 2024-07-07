import Product from "../models/Product.js";
import Request from "../models/Request.js";

const handleWebhook = async (req, res) => {
  const { request_id, output_urls, product_oid } = req.body;
  console.log("calling hook with: ", req.body);
  try {
    const product = await Product.findOne({ request_id, _id: product_oid });
    product.output_img_urls.push(...output_urls);
    await product.save();

    const products = await Product.find({ request_id });
    const allUpdated = products.every((p) => p.output_img_urls.length > 0);

    // changing status on completion
    if (allUpdated) {
      await Request.updateOne({ request_id }, { status: "completed" });
      res.json({ message: "Request marked for completion" });
    } else {
      res.json({ message: "Acknowledged from webhook" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handleWebhook;
