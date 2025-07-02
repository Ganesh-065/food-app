import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "dotenv";

// Routes
import restaurantRoutes from "./routes/restaurants";
import authRoutes from "./routes/auth";
import cartRoutes from "./routes/cart";
import checkoutRoutes from "./routes/checkout";
import reviewRoutes from "./routes/reviews";

// Middleware
import { errorHandler } from "./middleware/errorHandler";

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow credentials and set origin from env or default
// const allowedOrigin = "http://localhost:5173";
const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin,      // Must be exact origin if credentials: true
    credentials: true,          // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// const allowedOrigins = ["https://food-app-liart-xi.vercel.app/", "http://localhost:5173"];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true, // if you're using cookies/auth
//   })
// );

app.options("*", cors()); // Handle preflight OPTIONS requests

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
