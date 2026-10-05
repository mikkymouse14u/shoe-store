// Entry point: wires together config, the database connection, and the
// Express app, then starts listening for HTTP requests.

// Loading "dotenv/config" for its side effect (reading .env into
// process.env) must happen before "./config/env.js" is imported, since
// config/env.ts reads process.env values as soon as it's imported.
import "dotenv/config";
import { env } from "./config/env.js";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";
import express from "express";
import authRoute from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { getErrorMessage } from "./utils/errors.js";

// Some hosting/dev environments ship with a flaky or slow default DNS
// resolver, which can make mongoose.connect() below time out even though
// the database is reachable. Pointing Node at public DNS servers (Google
// and Cloudflare) works around that. This is best-effort: if it fails we
// just carry on with whatever DNS setup the environment already had.
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("Overrode Node DNS servers");
} catch (e) {
  console.log("Could not set DNS servers");
}

// express() creates the "app" — the object that holds all our routes and
// middleware, and that we eventually hand to app.listen() to start a server.
const app = express();

// app.use() registers "middleware": functions that run on every incoming
// request before it reaches a route handler. Order matters — middleware
// added here runs top-to-bottom for each request.
//   - cors() adds the headers that let the frontend (running on a
//     different origin/port during development) call this API from the
//     browser without being blocked by same-origin restrictions.
//   - express.json() reads the raw request body and, if it's JSON, parses
//     it into req.body — without this, req.body would be undefined for
//     every POST request.
app.use(cors());
app.use(express.json());

// Mounting a router: every request whose path starts with "/api/auth" gets
// handed to authRoute, and everything under "/api/products" goes to
// productRoutes. Each router only has to know about its own relative paths
// (e.g. "/signup"), and the full path becomes "/api/auth/signup".
app.use("/api/auth", authRoute);
app.use("/api/products", productRoutes);

// env.PORT / env.MONGO_URI are already validated, non-optional values by
// the time we get here — see config/env.ts for why that check happens up
// front instead of here.
const PORT = env.PORT;
const mongouri = env.MONGO_URI;

// Connect to MongoDB first, and only start accepting HTTP requests once
// that succeeds — there's no point serving requests that would just fail
// trying to hit a database we're not connected to yet.
mongoose
  .connect(mongouri)
  .then(() => {
    console.log("database connected");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    // If the database connection fails, there's nothing useful the server
    // can do, so log the reason and exit rather than starting up in a
    // broken state.
    console.error("Database connection error:", getErrorMessage(error));
    process.exit(1);
  });
