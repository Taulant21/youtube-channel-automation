const fs = require('fs')
const path = require('path')

const { getTwitchAuthToken } = require('./twitch/auth')
const { getTopDailyFeaturedClips } = require('./twitch/clips')
const { downloadClips } = require('./video-download-handler/downloadVideos')
const { mergeVideos } = require('./video-editor/merge-videos')
const { uploadVideo } = require('./youtube-uploader/upload')

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

  if (mergeVideoStatus.success) {
    const uploadResponse = await uploadVideo({
      credits: mergeVideoStatus.credits
    })

    console.log(uploadResponse)
  } else {
    throw new Error('Error while merging videos')
  }

  if (videosList.length > 0) {
    cleanUpDownloadedClips({ videosList })
  }
}

function cleanUpDownloadedClips({ videosList }) {
  for (const video of videosList) {
    fs.unlink(path.join(videosBaseUrl, video), (err) => {
      if (err) throw err
    })
  }

  fs.unlink(path.resolve('output.mp4'), (err) => {
    if (err) throw err
  })

  console.log('Clips were deleted')
}
