import { Hono } from "hono";
import { ethers } from "ethers";
import { cors } from "hono/cors";

const app = new Hono();

// Middleware
app.use(cors());
// Routes
app.get("/", (c) => {
  return c.json({ message: "Welcome to the W3 Playground API" });
});

// Listen on port 3000
app.listen(3000);

export default app;
