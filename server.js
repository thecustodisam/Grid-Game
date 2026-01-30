import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dataService from './src/api/dataService.js'
import apiRoutes from './src/api/routes.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(compression())
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// Load data on startup
console.log('🚀 Starting NBA Top Shot Immaculate Grid API...')
try {
  dataService.loadData()
  console.log('✅ Data loaded successfully')
} catch (error) {
  console.error('❌ Failed to load data:', error)
  process.exit(1)
}

// API routes
app.use('/api', apiRoutes)

// Root endpoint
app.get('/', (req, res) => {
  const stats = dataService.getStats()
  res.json({
    name: 'NBA Top Shot Immaculate Grid API',
    version: '1.0.0',
    status: 'running',
    stats,
    endpoints: {
      health: 'GET /api/health',
      moments: 'GET /api/moments',
      players: 'GET /api/players',
      playerMoments: 'GET /api/players/:name/moments',
      validate: 'POST /api/validate',
      hint: 'GET /api/hint?row=Lakers&col=Legendary',
      categories: 'GET /api/categories',
      dailyGrid: 'GET /api/grid/daily',
      stats: 'GET /api/stats'
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err)
  res.status(500).json({
    success: false,
    error: err.message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`\n🎉 Server running on http://localhost:${PORT}`)
  console.log(`📊 ${dataService.getStats().totalMoments} moments loaded`)
  console.log(`👥 ${dataService.getStats().uniquePlayers} players available`)
  console.log(`\n📖 API Documentation: http://localhost:${PORT}\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully')
  process.exit(0)
})
