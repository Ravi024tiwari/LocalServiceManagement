import express, { Request, Response } from "express"
import cors from "cors"
import morgan from "morgan"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js"
import serviceRouter from "./routes/service.route.js"
import ProviderProfileRouter from "./routes/providerProfile.route.js"
import bookingRouter from "./routes/booking.route.js"
import paymentRouter from "./routes/payment.route.js"
import userRouter from "./routes/user.route.js"

const app = express()

morgan("dev")

dotenv.config()

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/health", (req: Request, res: Response) => {
    return res.json({
        status: 200,
        message: "Server is running",
    })
})

app.use("/api/auth", authRoute)
app.use("/api/user", userRouter)
app.use("/api/service", serviceRouter)
app.use("/api/provider-profile", ProviderProfileRouter)
app.use("/api/booking", bookingRouter)
app.use("/api/payment", paymentRouter)

export default app;