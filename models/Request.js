import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    request_id: {
      type: String,
      unique: true,
    },
    status: String,
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

export default Request;
