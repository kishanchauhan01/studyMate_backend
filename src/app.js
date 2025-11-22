import express from "express";
import {errorHandler} from "./middlewares/errorHandler.middleware.js"

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("<h1> Welcome to the root </h1>");
});

import authRouter from "./routers/auth.route.js";

app.use("/api/v1/auth", authRouter);


app.use(errorHandler)

export { app };
