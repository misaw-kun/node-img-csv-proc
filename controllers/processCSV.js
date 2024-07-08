import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import parse from "csv-parser";

import Request from "../models/Request.js";
import Product from "../models/Product.js";
import imageQueue from "../utils/queue.js";
import Database from "../utils/connect.js";

const processCSV = async (req, res) => {
  const request_id = uuidv4();
  const results = [];
  const redis = Database.getInstance().redis_conn;

  const expectedColumns = ["S. No.", "Product Name", "Input Image Urls"];
  let isValid = true;
  let errors = [];

  fs.createReadStream(req.file.path)
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      })
    )
    .on("headers", (headers) => {
      // validating input csv
      expectedColumns.forEach((col) => {
        if (!headers.includes(col)) {
          isValid = false;
          errors.push(`Missing required column: ${col}`);
        }
      });
    })
    .on("data", (data) => {
      if (isValid) {
        const row = [
          data["S. No."],
          data["Product Name"],
          data["Input Image Urls"]?.split(","),
        ];

        if (
          !row[0] ||
          !row[1] ||
          !row[2] ||
          row[2].some((item) => item === "")
        ) {
          isValid = false;
          errors.push(`Invalid data at row with Serial Number: ${row[0]}`);
        }

        // push the valid row into results for processing
        results.push(row);
      }
    })
    .on("end", async () => {
      if (!isValid) {
        return res.status(400).json({ errors });
      }
      // creating a request ticket
      try {
        await Request.create({
          request_id,
          status: "pending",
        });

        // storing product listings with urls
        results.forEach(async (row) => {
          // const product_id = uuidv4();
          const input_img_urls = row[2];

          const product = {
            // product_id,
            request_id,
            product_name: row[1],
            input_img_urls,
            output_img_urls: [],
          };

          const doc = await Product.create(product);

          // tracking total number of jobs per product (i.e. images per product)
          const key = `product:${doc._id}:request:${request_id}`;
          redis.set(key, input_img_urls.length);
          // TODO: manage queue from here
          input_img_urls.forEach(async (url) => {
            await imageQueue.add("processImage", {
              url,
              requestId: request_id,
              productOid: doc._id,
            });
          });
        });

        await res.json({ request_id });
      } catch (error) {
        res.status(500).json({ error });
      }
    })
    .on("error", (err) => {
      res.status(500).json({ err });
    });
};

export default processCSV;
