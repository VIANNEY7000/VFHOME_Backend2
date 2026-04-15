import dotenv from 'dotenv'
import express from 'express'
import cors from "cors"
import connectDB from "./config/db.js"
import userRoute from './routes/user_route.js'
import producRouter from './routes/product_route.js'
import orderRoute from './routes/order_route.js'
import paystackRoute from './routes/paystack_route.js'
import admin from './routes/admin_route.js'

dotenv.config()

const app = express()
app.use(cors());

// ✅ Webhook MUST come before express.json() — needs raw body
app.use('/api/paystack/webhook', express.raw({ type: 'application/json' }));

// ✅ All other routes use normal JSON parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ROUTES
app.use('/api/auth', userRoute)
app.use('/api/products', producRouter)
app.use('/api/orders', orderRoute)
app.use('/api/paystack', paystackRoute)
app.use('/api/admin', admin)



// PORT LISTEN
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('WELCOME SIR')
})

app.listen(5000, () => {
    console.log(`backend runing on port ${PORT}`)
}) 

connectDB()

