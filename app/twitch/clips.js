const _ = require('lodash')
const axios = require('axios')
const { DateTime } = require('luxon')

module.exports = { getTopDailyFeaturedClips }

const supportedLanguages = new Set(['en', 'en-gb'])
const clipStartTime = DateTime.now().minus({ days: 1 }).toISO()

async function getTopDailyFeaturedClips ({ twitchAuthToken, gameConfigs, twitchManualLinks }) {
  const hasManualLinks = !_.isEmpty(twitchManualLinks)

  let extractedIdsFromLinks = null

  if (hasManualLinks) {
    extractedIdsFromLinks = twitchManualLinks.map((clipLink) => clipLink.split('clip/')[1])
  }

  const { data: clips } = await axios.get(process.env.TWITCH_CLIPS_API_URL, {
    params: {
      ...(hasManualLinks
        ? { id: extractedIdsFromLinks }
        : {
          game_id: gameConfigs.gameTwitchId,
          first: 100
        }
      ),
      started_at: clipStartTime,
      is_featured: false,
    },
    headers: {
      'Client-ID': process.env.TWITCH_APP_CLIENT_ID,
      Authorization: `Bearer ${twitchAuthToken}`
    }
  })

  return clips.data
    .filter((d) => supportedLanguages.has(d.language))
    .map((d) => {
      return {
        ...d,
        // This is how twitch preserves the videos directly
        downloadUrl: d.thumbnail_url?.replace('-preview-480x272.jpg', '.mp4')
      }
    })
}
