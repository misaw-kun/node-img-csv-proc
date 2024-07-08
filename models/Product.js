import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    request_id: {
      type: mongoose.Schema.Types.String,
      ref: "Request",
    },
    // product_id: {
    //   type: String,
    //   unique: true,
    // },
    product_name: String,
    input_img_urls: [String],
    output_img_urls: [String],
  },
  {
    timestamps: true,
  }
);

// const urlRegex =
//   /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

// productSchema
//   .path("input_img_urls")
//   .validate(
//     (val) => val !== "" && val.forEach((url) => urlRegex.test(url)),
//     "Invalid URL"
//   );

const Product = mongoose.model("Product", productSchema);

export default Product;
