import { getAllPlays, transformPlayToMoment } from './src/services/flowService.js'
import { writeFileSync } from 'fs'

async function fetchAndSaveMoments() {
  console.log('🏀 Fetching NBA Top Shot moments from Flow blockchain...\n')

  const BATCH_SIZE = 7864 // Fetch ALL moments (complete catalog)

  try {
    console.log(`Fetching first ${BATCH_SIZE} moments...`)
    const plays = await getAllPlays({
      limit: BATCH_SIZE,
      startFrom: 1,
      onProgress: (progress) => {
        // Report every 100 moments for large batches
        if (progress.current % 100 === 0 || progress.current === progress.total) {
          console.log(`Progress: ${progress.current}/${progress.total} (${Math.round(progress.current / progress.total * 100)}%)`)
        }
      }
    })

    console.log(`\n✅ Fetched ${plays.length} plays`)

    // Transform to game format
    console.log('Transforming to game format...')
    const moments = plays.map(play => transformPlayToMoment({ playID: play.playID, ...play }))

    // Filter valid moments
    const validMoments = moments.filter(m =>
      m.player && m.player !== 'Unknown Player' &&
      m.team && m.team !== 'Unknown Team' &&
      m.season && m.season !== 'Unknown Season'
    )

    console.log(`✅ Transformed ${validMoments.length} valid moments\n`)

    // Get statistics
    const uniquePlayers = new Set(validMoments.map(m => m.player))
    const uniqueTeams = new Set(validMoments.map(m => m.team))
    const uniqueSeasons = new Set(validMoments.map(m => m.season))
    const uniquePlayTypes = new Set(validMoments.map(m => m.playType))

    console.log('📊 Dataset Statistics:')
    console.log(`   - ${uniquePlayers.size} unique players`)
    console.log(`   - ${uniqueTeams.size} unique teams`)
    console.log(`   - ${uniqueSeasons.size} unique seasons`)
    console.log(`   - ${uniquePlayTypes.size} unique play types`)
    console.log()

    // Show sample players
    console.log('🌟 Sample players in dataset:')
    Array.from(uniquePlayers).slice(0, 20).forEach((player, i) => {
      console.log(`   ${i + 1}. ${player}`)
    })
    console.log()

    // Save to file
    const outputPath = './src/data/topshot-moments.json'
    writeFileSync(outputPath, JSON.stringify(validMoments, null, 2))
    console.log(`✅ Saved ${validMoments.length} moments to ${outputPath}`)

    // Also save unique players list
    const playersPath = './src/data/topshot-players.json'
    writeFileSync(playersPath, JSON.stringify(Array.from(uniquePlayers).sort(), null, 2))
    console.log(`✅ Saved ${uniquePlayers.size} players to ${playersPath}`)

    console.log('\n🎉 Success! You can now use this real NBA Top Shot data in your game.')

  } catch (error) {
    console.error('❌ Error fetching moments:', error)
    process.exit(1)
  }
}

fetchAndSaveMoments()
