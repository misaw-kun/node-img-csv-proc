import express from "express";
import multer from "multer";
import Database from "./utils/connect.js";
import processCSV from "./controllers/processCSV.js";
import checkStatus from "./controllers/checkStatus.js";
import handleWebhook from "./controllers/handleWebhook.js";

const app = express();
app.use(express.json());

const db_conn = Database.getInstance();
const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  res.send(`meow , api works !!`);
});

app.post("/upload", upload.single("csv"), processCSV);
app.get("/status/:request_id", checkStatus);
app.post("/webhook", handleWebhook);

app.listen(PORT, async () => {
  console.log(`App listening on port ${PORT}`);
  await db_conn.connectDb();
  await db_conn.connectRedis();
});
