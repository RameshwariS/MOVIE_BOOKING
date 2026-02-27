const extractYouTubeId = (url) => {
  if (!url) return null
  const match =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) || []
  return match[1] || null
}

export const getPosterUrl = (movie) => {
  if (!movie) return null
  if (movie.posterURL) return movie.posterURL
  const id = extractYouTubeId(movie.trailerURL)
  if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
  return null
}
