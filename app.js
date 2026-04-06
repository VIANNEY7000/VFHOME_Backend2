import  dotenv  from 'dotenv'
import express from 'express'
import cors from "cors"
import connectDB from "./config/db.js"
import userRoute from './routes/user_route.js'
import producRouter from './routes/product_route.js'
import orderRoute from './routes/order_route.js'
import paystackRoute from './routes/paystack_route.js'


dotenv.config()

const app = express()
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ROUTE
app.use('/api/auth', userRoute)
app.use('/api/products', producRouter)
app.use('/api/orders', orderRoute)
app.use('/api/paystack', paystackRoute)


// for debuging
app.get('/test-paystack-key', (req, res) => {
  res.json({
    keyExists: !!process.env.PAYSTACK_SECRET_KEY,
    keyPreview: process.env.PAYSTACK_SECRET_KEY
      ? process.env.PAYSTACK_SECRET_KEY.slice(0, 10) + "..."
      : "NOT FOUND",
    testVar: process.env.TEST_VAR || "TEST_VAR NOT FOUND",
    nodeEnv: process.env.NODE_ENV || "NODE_ENV NOT SET"
  })
})



// PORT LISTEN
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('WELCOME SIR')
})

app.listen(5000, () => {
    console.log(`backend runing on port ${PORT}`)
}) 

connectDB()

