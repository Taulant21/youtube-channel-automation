const fs = require('fs')
const path = require('path')

const { getTwitchAuthToken } = require('./twitch/auth')
const { getTopDailyFeaturedClips } = require('./twitch/clips')
const { downloadClips } = require('./video-download-handler/downloadVideos')
const { mergeVideos } = require('./video-editor/merge-videos')
const { uploadVideo } = require('./youtube-uploader/upload')
const { getVideoClips } = require('./twitch/getVideoClip')

module.exports = { startUpload }

const gameCategoriesConfig = require('./category-configurations.json')
const twitchManualLinks = require('./twitch-manual-clip-links.json')
const videosBaseUrl = `${__dirname}/video-download-handler/videos/`

async function startUpload() {
  const twitchAuthToken = await getTwitchAuthToken()

  console.log(`Login Succeeded, Token: ${twitchAuthToken}`)

  for(let i = 0; i < gameCategoriesConfig.length; i++) {
    const gameConfigs = gameCategoriesConfig[i]

    console.log(`Game in progress: ${gameConfigs.gameName}`);

    const topDailyClips = await getTopDailyFeaturedClips({ twitchAuthToken, gameConfigs, twitchManualLinks })


    const videos = await getVideoClips({Clips: topDailyClips})

    try {
      await downloadClips({ clips: topDailyClips , videoLink : videos })
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
        credits: mergeVideoStatus.credits,
        chapters: mergeVideoStatus.chapters,
        gameConfigs
      })
  
      console.log(uploadResponse)

      if(uploadResponse.success && videosList.length > 0) {
        cleanUpDownloadedClips({ videosList })
      }
    } else {
      throw new Error('Error while merging videos')
    }
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
