import express from 'express'
import DatabaseServices from '~/services/database.services'
import UserController from '../src/controller/UserController'
import cors from 'cors'
import router from './routers/users.routers'
//import router from './routes'
import cookieParser from 'cookie-parser'

const app = express()
const port = 3000

// Middleware to parse JSON
// app.use(cors())
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // hoặc Postman
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())
app.use('/api', router)
// Instantiate the controller

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
