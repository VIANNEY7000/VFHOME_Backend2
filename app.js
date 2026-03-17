import  dotenv  from 'dotenv'
import express from 'express'
import connectDB from "./config/db.js"
import userRoute from './routes/user_route.js'


dotenv.config()

const app = express()
app.use(express.json())


app.use('/api/auth', userRoute)


// PORT LISTEN
const PORT = process.env.PORT || 5000

app.get('/', (req, res) => {
    res.send('WELCOME SIR')
})

app.listen(5000, () => {
    console.log(`backend runing on port ${PORT}`)
}) 

connectDB()

