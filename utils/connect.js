import mongoose from "mongoose";
import { Redis } from "ioredis";

class Database {
  constructor() {
    this.mongo_conn = null;
    this.redis_conn = null;
  }

  async connectDb() {
    if (this.mongo_conn) return this.mongo_conn;

    try {
      this.mongo_conn = await mongoose
        .connect(process.env.MONGO_URI, {
          connectTimeoutMS: 3000,
          socketTimeoutMS: 3000,
        })
        .then(() => console.log("mongodb connected"));
    } catch (error) {
      console.error("db connection failed: ", error);
    }

    return this.mongo_conn;
  }

  async connectRedis() {
    if (this.redis_conn) return this.redis_conn;

    try {
      this.redis_conn = new Redis({
        host: process.env.REDIS_URI,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASS,
      }).on("connect", () => console.log("connected to redis"));
    } catch (error) {
      console.error("redis connection failed: ", error);
    }

    return this.redis_conn;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }

    return this.instance;
  }
}

export default Database;
