const fs = require('fs')

const { getTwitchAuthToken } = require('./twitch/auth')
const { getTopDailyFeaturedClips } = require('./twitch/clips')
const { downloadClips } = require('./video-download-handler/downloadVideos')
const { mergeVideos } = require('./video-editor/merge-videos')

module.exports = { startUpload }

const videosBaseUrl = `${__dirname}/video-download-handler/videos/`

async function startUpload() {
  const twitchAuthToken = await getTwitchAuthToken()

  console.log(`Login Succeeded, Token: ${twitchAuthToken}`)

  const topDailyClips = await getTopDailyFeaturedClips({ twitchAuthToken })

  try {
    await downloadClips({ clips: topDailyClips })
  } catch (e) {
    console.log('Something went wrong while downloading clips')
  }

  const videosList = fs.readdirSync(videosBaseUrl)

  const mergeVideoStatus = await mergeVideos({
    videosList,
    videosBaseUrl
  })

  console.log(mergeVideoStatus)
}
