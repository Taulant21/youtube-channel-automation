const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const cliProgress = require('cli-progress')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { DateTime } = require('luxon')

const TOKEN_PATH = `${__dirname}/token.json`

module.exports = { uploadVideo }

async function uploadVideo({ credits }) {
  const refinedCredits = [...new Set(credits)]

  const auth = await authorize()
  const videoPath = path.resolve('output.mp4')
  const videoSize = fs.statSync(videoPath).size
  const title = `Daily League of Legends Stream Moments ${DateTime.now().toFormat(
    'dd/MM/yyyy'
  )}`
  const description = `Note: The video contains the most viewed clips on the last 24 hours\nCredits: \n${refinedCredits.join(
    '\n'
  )}`

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
          description: description,
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
        body: fs.createReadStream(path.resolve('thumbnail.png'))
      }
    },
    (err) => {
      if (err) {
        console.log('Error while setting thumbnail: ' + err)
        return
      }
    }
  )

  console.log('Thumbnail edited')

  return {
    uploadStatus: res.data.status.uploadStatus,
    file: res.data.snippet.title,
    urlID: res.data.id
  }
}

async function authorize() {
  const credentials = await getCredentials()
  const { client_secret, client_id, redirect_uris } = credentials.web
  const oAuth2Client = new OAuth2(client_id, client_secret, redirect_uris[0])

  // Check if we have previously stored a token.(Which we always do)
  let token = await readAccessToken()

  if (!token) {
    return new Error('Access Token is missing')
  }

  oAuth2Client.setCredentials(token)

  console.log('Google login successful')

  return oAuth2Client
}

async function getCredentials() {
  try {
    // Load client secrets from a local file.
    const content = await fsp.readFile(`${__dirname}/credentials.json`)
    return JSON.parse(content)
  } catch (error) {
    console.log(`Error loading client secret file: ${error}`)
  }
}

async function readAccessToken() {
  try {
    const token = await fsp.readFile(TOKEN_PATH)
    return JSON.parse(token)
  } catch (error) {
    return false
  }
}
