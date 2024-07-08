import dotenv from "dotenv";
dotenv.config();
import { Queue } from "bullmq";
import IOredis from "ioredis";

export const redis_conn = new IOredis({
  host: process.env.REDIS_URI,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASS,
  maxRetriesPerRequest: null,
});

const imageQueue = new Queue("imageQueue", { connection: redis_conn });

imageQueue
  .clean(0, 1000, "completed")
  .then(() => console.log("Cleaned completed jobs"))
  .catch(console.error);

imageQueue
  .clean(0, 1000, "failed")
  .then(() => console.log("Cleaned failed jobs"))
  .catch(console.error);

export default imageQueue;
