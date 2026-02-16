import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});