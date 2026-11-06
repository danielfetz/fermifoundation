// Roughly where a visit comes from, for the tournament finder on the home page: the city and coordinates Vercel works
// out from the visitor's IP address and passes in its x-vercel-ip-* headers. Nothing is stored.
module.exports = function where(req, res) {
  const h = req.headers
  const lat = parseFloat(h['x-vercel-ip-latitude'])
  const lon = parseFloat(h['x-vercel-ip-longitude'])
  res.setHeader('Cache-Control', 'private, no-store')
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return res.status(200).json({})
  let city = ''
  try { city = decodeURIComponent(h['x-vercel-ip-city'] || '') } catch {}
  return res.status(200).json({
    city,
    region: String(h['x-vercel-ip-country-region'] || ''),
    country: String(h['x-vercel-ip-country'] || ''),
    lat,
    lon,
  })
}
