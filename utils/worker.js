import { QueueEvents, Worker } from "bullmq";
import imageQueue, { redis_conn } from "./queue.js";
import sharp from "sharp";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import Database from "./connect.js";

// const redis = Database.getInstance().redis_conn;

const outputDir = "./output_images";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const imageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { url, requestId, productOid } = job.data;
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();

      const inputBuffer = Buffer.from(data, "binary");
      const outputBuffer = await sharp(inputBuffer)
        .jpeg({ quality: 50 })
        .toBuffer();
      console.log(`Processed image from ${url}`);

      const outputFilename = `output-${uuidv4()}.jpg`;
      const outputPath = `${outputDir}/${outputFilename}`;

      //    TODO: store the images in a bucket (S3, cloudinary)
      fs.writeFileSync(outputPath, outputBuffer);
      console.log(`Saved image to ${outputPath}`);

      //   TODO: output URL changes when 3rd party storage provider used

      const outputUrl = outputPath;

      //    TODO: update product document for output urls through WEBHOOK
      return { outputUrl, requestId, productOid };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  { connection: redis_conn }
);

const queueEvents = new QueueEvents("imageQueue", { connection: redis_conn });

queueEvents.on("completed", async ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed!`);

  const { requestId, productOid, outputUrl } = returnvalue;
  const key = `product:${productOid}:request:${requestId}`;
  const completedCount = await redis_conn.incr(`${key}:completed`);

  const totalJobsPerProduct = await redis_conn.get(key);
  console.log(
    "completed count",
    completedCount,
    "jobs per prod",
    totalJobsPerProduct
  );

  if (parseInt(completedCount, 10) === parseInt(totalJobsPerProduct, 10)) {
    const jobs = await imageQueue.getJobs(["completed"]);
    //  getting all completed jobs "per product"
    const productJobs = jobs.filter(
      (job) =>
        job.data.requestId === returnvalue.requestId &&
        job.data.productOid === returnvalue.productOid
    );

    //   CHECK: logic from here for grouping
    if (productJobs.length > 0) {
      // collating all the output urls per product in one place for single webhook call
      let outputUrls = productJobs.map((job) => job.returnvalue.outputUrl);

      console.log("Calling webhook...");
      const webhookURL = "http://localhost:3000/webhook";
      try {
        const response = await fetch(webhookURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request_id: returnvalue.requestId,
            product_oid: returnvalue.productOid,
            output_urls: outputUrls,
          }),
        });

        // removing tracker key per successful batch
        await redis_conn.del(key);
        await redis_conn.del(`${key}:completed`);

        if (!response.ok) {
          throw new Error("failed to call webhook: ", response.body);
        }

        const responseData = await response.json();
        console.log("Webhook response:", responseData);
      } catch (error) {
        console.error("Error calling webhook:", error);
      }
    }
  }
});

queueEvents.on("failed", (job) =>
  console.error(`Job ${job.id} failed! Reason: ${job.failedReason}`)
);

export default imageWorker;
