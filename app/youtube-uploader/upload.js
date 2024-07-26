const path = require('path')
const fs = require('fs')
const cliProgress = require('cli-progress')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { DateTime } = require('luxon')

module.exports = { uploadVideo }

async function uploadVideo({ credits, chapters, gameConfigs }) {
  const refinedCredits = [...new Set(credits)]

  const auth = await authorize({
    credentials: gameConfigs.googleCredentials,
    accessToken: gameConfigs.accessToken
  })

  const videoPath = path.resolve('output.mp4')
  const videoSize = fs.statSync(videoPath).size
  const title = gameConfigs.youtubeVideoTitle

  const description = 'Note: The video contains the most viewed clips on the last 24 hours'

  const credit = `\nCredits: \n${chapters.join('\n')} \n\n${refinedCredits.join(' ')} `

  const finalDescription = gameConfigs.canUseOutlinks 
  ? `${description}${credit}`
  : description

  // Initialize youtube API
  const youtube = google.youtube({ version: 'v3', auth })

  console.log(`Uploading: ${title}`)
  const progressBar = new cliProgress.SingleBar(
    {
      format: '|{bar}| {percentage}% uploaded',
      hideCursor: true,
      stopOnComplete: true
    },
    cliProgress.Presets.shades_grey
  )
  progressBar.start(100, 0)

  const res = await youtube.videos.insert(
    {
      part: 'id,snippet,status',
      notifySubscribers: false,
      requestBody: {
        snippet: {
          title: title,
          description: finalDescription,
          // 20 is gaming category
          categoryId: '20'
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    },
    {
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / videoSize) * 100
        progressBar.update(progress)
      }
    }
  )

  console.log('Video Uploaded Succesfully, Starting Thumbnail Edit...')

  const thumbnailRes = await youtube.thumbnails.set(
    {
      auth: auth,
      videoId: res.data.id,
      media: {
        body: fs.createReadStream(path.resolve(gameConfigs.thumbnailPath))
      }
    },
    (err) => {
      if (err) {
        console.log('Error while setting thumbnail: ' + err)
        return {
          success: false
        }
      }
    }
  )

  console.log('Thumbnail edited')

  return {
    success: true,
    uploadStatus: res.data.status.uploadStatus,
    file: res.data.snippet.title,
    urlID: res.data.id
  }
}

async function authorize({ credentials, accessToken }) {
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new OAuth2(client_id, client_secret, redirect_uris[0])

  const token = accessToken

  oAuth2Client.setCredentials(token)

  console.log('Google login successful')

  return oAuth2Client
}
