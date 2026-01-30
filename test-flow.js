import {
  getNextPlayID,
  getPlayMetadata,
  getAllPlays,
  getSetData,
  transformPlayToMoment
} from './src/services/flowService.js'

async function testFlowIntegration() {
  console.log('🏀 Testing NBA Top Shot Flow Integration...\n')

  try {
    // Test 1: Get total number of plays
    console.log('1️⃣ Fetching total number of plays...')
    const nextPlayID = await getNextPlayID()
    console.log(`   ✅ Total plays in NBA Top Shot: ${nextPlayID - 1}\n`)

    // Test 2: Get a specific play's metadata
    console.log('2️⃣ Fetching Play #1 metadata...')
    const play1 = await getPlayMetadata(1)
    console.log('   ✅ Play #1 metadata:')
    console.log(JSON.stringify(play1, null, 2))
    console.log()

    // Test 3: Transform to game format
    console.log('3️⃣ Transforming to game format...')
    const moment = transformPlayToMoment({ playID: 1, ...play1 })
    console.log('   ✅ Transformed moment:')
    console.log(`   Player: ${moment.player}`)
    console.log(`   Team: ${moment.team}`)
    console.log(`   Season: ${moment.season}`)
    console.log(`   Play Type: ${moment.playType}`)
    console.log(`   Tier: ${moment.tier}`)
    console.log()

    // Test 4: Fetch multiple plays
    console.log('4️⃣ Fetching first 10 plays...')
    const plays = await getAllPlays({
      limit: 10,
      startFrom: 1,
      onProgress: (progress) => {
        process.stdout.write(`\r   Progress: ${progress.current}/${progress.total} (Play #${progress.playID})`)
      }
    })
    console.log('\n   ✅ Fetched plays:')
    plays.forEach((play, i) => {
      console.log(`   ${i + 1}. ${play.FullName || 'Unknown'} - ${play.TeamAtMoment || 'Unknown Team'}`)
    })
    console.log()

    // Test 5: Get set data
    console.log('5️⃣ Fetching Set #1 data...')
    const set1 = await getSetData(1)
    console.log('   ✅ Set #1 data:')
    console.log(JSON.stringify(set1, null, 2))
    console.log()

    console.log('✅ All tests passed! Flow integration is working.')
    console.log('\n📊 Summary:')
    console.log(`   - NBA Top Shot has ${nextPlayID - 1} total plays`)
    console.log(`   - Successfully fetched and transformed ${plays.length} plays`)
    console.log(`   - Ready to build your game with real moment data!`)

  } catch (error) {
    console.error('❌ Error during testing:', error)
    process.exit(1)
  }
}

// Run the test
testFlowIntegration()
