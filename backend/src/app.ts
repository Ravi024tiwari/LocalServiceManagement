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
import likedServiceRouter from "./routes/likedService.route.js"
import providerCustomerRouter from "./routes/providerCustomer.route.js"
import adminDashboardRouter from "./routes/adminDashboard.route.js"
import adminProviderRouter from "./routes/adminProvider.route.js"
import adminBookingRouter from "./routes/adminBooking.route.js"
import adminPaymentRouter from "./routes/adminPayment.route.js"
import adminReviewRouter from "./routes/adminReview.route.js"
import adminCategoryRouter from "./routes/adminCategory.route.js"
import reviewRouter from "./routes/review.route.js"

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
app.use("/api/liked-services", likedServiceRouter)
app.use("/api/provider-customers", providerCustomerRouter)
app.use("/api/reviews", reviewRouter)
app.use("/api/admin/dashboard", adminDashboardRouter)
app.use("/api/admin/providers", adminProviderRouter)
app.use("/api/admin/bookings", adminBookingRouter)
app.use("/api/admin/payments", adminPaymentRouter)
app.use("/api/admin/reviews", adminReviewRouter)
app.use("/api/admin/categories", adminCategoryRouter)

export default app;