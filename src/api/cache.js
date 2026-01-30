import NodeCache from 'node-cache'

// Cache with 1 hour TTL by default
const cache = new NodeCache({
  stdTTL: 3600, // 1 hour
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Don't clone objects (faster)
})

// Cache wrapper with logging
export function getCached(key, fetchFn, ttl = 3600) {
  const cached = cache.get(key)

  if (cached !== undefined) {
    console.log(`💾 Cache HIT: ${key}`)
    return cached
  }

  console.log(`🔍 Cache MISS: ${key}`)
  const value = fetchFn()
  cache.set(key, value, ttl)

  return value
}

// Clear specific key
export function clearCache(key) {
  cache.del(key)
  console.log(`🗑️  Cleared cache: ${key}`)
}

// Clear all cache
export function clearAllCache() {
  cache.flushAll()
  console.log(`🗑️  Cleared all cache`)
}

// Get cache stats
export function getCacheStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
  }
}

export default cache
