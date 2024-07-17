const axios = require('axios')
const { DateTime } = require('luxon')

module.exports = { getTopDailyFeaturedClips }

const supportedLanguages = new Set(['en', 'en-gb'])
const clipStartTime = DateTime.now().minus({ days: 1 }).toISO()

async function getTopDailyFeaturedClips({ twitchAuthToken, gameConfigs }) {
  const { data: clips } = await axios.get(process.env.TWITCH_CLIPS_API_URL, {
    params: {
      game_id: gameConfigs.gameTwitchId,
      started_at: clipStartTime,
      is_featured: false,
      first: 100
    },
    headers: {
      'Client-ID': process.env.TWITCH_APP_CLIENT_ID,
      Authorization: `Bearer ${twitchAuthToken}`
    }
  })

  return clips.data
    .filter((d) => supportedLanguages.has(d.language) && d.broadcaster_name !== "MIRWANA")
    .map((d) => {
      return {
        ...d,
        // This is how twitch preserves the videos directly
        downloadUrl: d.thumbnail_url?.replace('-preview-480x272.jpg', '.mp4')
      }
    })
}
