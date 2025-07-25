import express from 'express'
import DatabaseServices from '~/services/database.services'
import UserController from '../src/controller/UserController'
import cors from 'cors'
import router from './routers/users.routers'
//import router from './routes'
import cookieParser from 'cookie-parser'
import emailRouter from './routers/email.routers'
import ScheduleCronJobController from './controller/ScheduleCronJobController'
const app = express()
const port = 3000

// Middleware to parse JSON
// app.use(cors())
app.use(
  cors()
)
app.use(express.json())
app.use(cookieParser())
app.use('/api', router)
app.use('/email', emailRouter)
// Instantiate the controller

// tạo cronjob tự động, do không có router nên phải tạo trong này luôn nhe ae
const scheduleCronJobController = new ScheduleCronJobController()
scheduleCronJobController.init()
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
