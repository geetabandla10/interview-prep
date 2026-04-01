import axios from 'axios';

const cache = new Map();

/**
 * Simple in-memory API cache with TTL
 * @param {string} url - The API endpoint
 * @param {object} options - Axios options (headers, etc.)
 * @param {number} ttl - Time to live in milliseconds (default 5 mins)
 */
export const cachedGet = async (url, options = {}, ttl = 5 * 60 * 1000) => {
  const key = url + JSON.stringify(options.params || {});
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`[Cache] Hit: ${url}`);
    return cached.data;
  }

  console.log(`[Cache] Miss: ${url}`);
  const response = await axios.get(url, options);
  cache.set(key, {
    data: response.data,
    timestamp: Date.now()
  });

  return response.data;
};

/**
 * Invalidate cache entries that match a certain pattern
 * @param {string} pattern - String pattern to match in cache keys
 */
export const invalidateCache = (pattern) => {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};
