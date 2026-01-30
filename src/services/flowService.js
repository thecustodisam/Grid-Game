import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"

// Configure Flow to use mainnet
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn"
})

// NBA Top Shot contract address on mainnet
const TOPSHOT_ADDRESS = "0x0b2a3299cc857e29"

/**
 * Get the next play ID to know how many plays exist
 */
export async function getNextPlayID() {
  try {
    const result = await fcl.query({
      cadence: `
        import TopShot from ${TOPSHOT_ADDRESS}

        access(all) fun main(): UInt32 {
          return TopShot.nextPlayID
        }
      `
    })
    return result
  } catch (error) {
    console.error("Error fetching next play ID:", error)
    throw error
  }
}

/**
 * Get metadata for a specific play
 */
export async function getPlayMetadata(playID) {
  try {
    const result = await fcl.query({
      cadence: `
        import TopShot from ${TOPSHOT_ADDRESS}

        access(all) fun main(playID: UInt32): {String: String} {
          let metadata = TopShot.getPlayMetaData(playID: playID)
            ?? panic("Play doesn't exist")
          return metadata
        }
      `,
      args: (arg, t) => [arg(playID, t.UInt32)]
    })
    return result
  } catch (error) {
    console.error(`Error fetching play ${playID}:`, error)
    return null
  }
}

/**
 * Get all play metadata (warning: this can take a while!)
 */
export async function getAllPlays(options = {}) {
  const { limit = 100, startFrom = 1, onProgress } = options

  console.log("Fetching total number of plays...")
  const nextPlayID = await getNextPlayID()
  const totalPlays = nextPlayID - 1

  console.log(`Found ${totalPlays} plays. Fetching up to ${limit}...`)

  const plays = []
  const endAt = Math.min(startFrom + limit, nextPlayID)

  for (let playID = startFrom; playID < endAt; playID++) {
    const metadata = await getPlayMetadata(playID)

    if (metadata) {
      plays.push({
        playID,
        ...metadata
      })
    }

    // Progress callback
    if (onProgress) {
      onProgress({
        current: playID - startFrom + 1,
        total: endAt - startFrom,
        playID
      })
    }

    // Add small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return plays
}

/**
 * Get set data by set ID
 */
export async function getSetData(setID) {
  try {
    const result = await fcl.query({
      cadence: `
        import TopShot from ${TOPSHOT_ADDRESS}

        access(all) fun main(setID: UInt32): TopShot.QuerySetData {
          let data = TopShot.getSetData(setID: setID)
            ?? panic("Could not get data for the specified set ID")
          return data
        }
      `,
      args: (arg, t) => [arg(setID, t.UInt32)]
    })
    return result
  } catch (error) {
    console.error(`Error fetching set ${setID}:`, error)
    return null
  }
}

/**
 * Get all plays in a specific set
 */
export async function getPlaysInSet(setID) {
  try {
    const result = await fcl.query({
      cadence: `
        import TopShot from ${TOPSHOT_ADDRESS}

        access(all) fun main(setID: UInt32): [UInt32] {
          let plays = TopShot.getPlaysInSet(setID: setID)
            ?? panic("Could not get plays for the specified set ID")
          return plays
        }
      `,
      args: (arg, t) => [arg(setID, t.UInt32)]
    })
    return result
  } catch (error) {
    console.error(`Error fetching plays in set ${setID}:`, error)
    return null
  }
}

/**
 * Transform play metadata to game format
 */
export function transformPlayToMoment(play) {
  // Determine tier from play metadata or set name
  // This is a simplified version - you may need more sophisticated logic
  const tier = play.Tier || 'Common' // Some plays may have tier in metadata

  return {
    player: play.FullName || 'Unknown Player',
    team: play.TeamAtMoment || 'Unknown Team',
    tier: tier,
    season: play.NbaSeason || 'Unknown Season',
    playID: play.playID,
    playType: play.PlayType || 'Unknown',
    dateOfMoment: play.DateOfMoment || '',
    metadata: play
  }
}

/**
 * Fetch and transform moments for the game
 */
export async function fetchMomentsForGame(options = {}) {
  const plays = await getAllPlays(options)
  const moments = plays.map(transformPlayToMoment)

  // Filter out invalid moments
  return moments.filter(m =>
    m.player !== 'Unknown Player' &&
    m.team !== 'Unknown Team' &&
    m.season !== 'Unknown Season'
  )
}
