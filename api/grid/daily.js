// Simple daily grid endpoint
// We'll test this works, then gradually add complexity

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const date = req.query.date || new Date().toISOString().split('T')[0]
    const league = req.query.league || 'NBA'

    // For now, return a simple test grid
    // Once this works, we'll add the real grid generation
    const testGrid = {
      rows: [
        { id: 'row1', type: 'team', value: 'Lakers', label: 'Los Angeles Lakers' },
        { id: 'row2', type: 'team', value: 'Warriors', label: 'Golden State Warriors' },
        { id: 'row3', type: 'team', value: 'Bulls', label: 'Chicago Bulls' }
      ],
      columns: [
        { id: 'col1', type: 'tier', value: 'Legendary', label: 'Legendary' },
        { id: 'col2', type: 'tier', value: 'Rare', label: 'Rare' },
        { id: 'col3', type: 'tier', value: 'Common', label: 'Common' }
      ]
    }

    res.status(200).json({
      success: true,
      date,
      league,
      data: testGrid
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
