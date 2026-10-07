import "dotenv/config";
import app from "./app.js";
import { connectMongo } from "./config/db.mongo.js";

const PORT = process.env.PORT || 5000;

await connectMongo();

app.listen(PORT, () => {
  console.log(`node-api listening on port ${PORT}`);
});
