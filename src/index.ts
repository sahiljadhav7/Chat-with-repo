import express from "express";

import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { queryRouter } from "./routes/query";

const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use("/query", queryRouter);

app.listen(env.PORT, () => console.log(`Listening on ${env.PORT}`));
