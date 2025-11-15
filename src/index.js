import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR before listening: ", error);
    });

    app.listen(port, "0.0.0.0", () => {
      console.log(`app is listening on http://localhost:${port}`);
    });
  })
  .catch((e) => {
    console.error("MONGO DB connection failed !!! ", err);
  });
