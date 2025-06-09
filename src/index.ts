import express from 'express'
import DatabaseServices from '~/services/database.services'
import UserController from '../src/controller/UserController'
import cors from 'cors'
import router from './routes'
const app = express()
const port = 3000

// Middleware to parse JSON
app.use(cors())
app.use(express.json())
app.use('/api', router)
// Instantiate the controller

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
