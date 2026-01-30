import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import apiRoutes from '../src/api/routes.js'
import dataService from '../src/api/dataService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Initialize data service (only once per cold start)
let dataLoaded = false
if (!dataLoaded) {
  try {
    console.log('Loading data for serverless function...')
    dataService.loadData()
    dataLoaded = true
    console.log('Data loaded successfully')
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

// API routes
app.use('/api', apiRoutes)

// Health check at root
app.get('/api', (req, res) => {
  const stats = dataService.getStats()
  res.json({
    name: 'NBA Top Shot Immaculate Grid API',
    version: '1.0.0',
    status: 'running',
    environment: 'vercel',
    stats
  })
})

// Export for Vercel serverless
export default app
