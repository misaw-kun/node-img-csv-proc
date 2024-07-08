import { Parser } from "@json2csv/plainjs/index.js";
import Product from "../models/Product.js";

const generateOutputCSV = async (req, res) => {
  const { request_id } = req.params;

  try {
    const products = await Product.find({ request_id });

    const csvData = products.map((product) => {
      const inputUrls = product.input_img_urls.join(",");
      const outputUrls = product.output_img_urls.reverse().join(",");

      return {
        "S. No.": product._id,
        "Product Name": product.product_name,
        "Input Image Urls": inputUrls,
        "Output Image Urls": outputUrls,
      };
    });

    const opts = {
      fields: [
        "S. No.",
        "Product Name",
        "Input Image Urls",
        "Output Image Urls",
      ],
    };
    const parser = new Parser(opts);
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment(`output-${request_id}.csv`);

    return res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default generateOutputCSV;
