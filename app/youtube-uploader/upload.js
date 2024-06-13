const path = require('path')

const { upload } = require('youtube-videos-uploader')

module.exports = { uploadVideo }

function uploadVideo() {
  // recoveryemail is optional, only required to bypass login with recovery email if prompted for confirmation
  const credentials = {
    email: process.env.YOUTUBE_EMAIL,
    pass: process.env.YOUTUBE_ACC_PW,
    recoveryemail: process.env.YOUTUBE_RECOVERY_EMAIL
  }

  const video1 = {
    path: path.resolve('output.mp4'),
    title: 'Daily League of Legends Stream Moments',
    description: 'Note: The video contains the most viewed clips on the last 24 hours',
    thumbnail: path.resolve('thumbnail.jpg'),
    publishType: 'PRIVATE',
    onProgress: (progress) => {
      console.log('progress', progress)
    },
    isAgeRestriction: false,
    isNotForKid: true,
    language: 'english'
  }

  // Returns uploaded video links in array
  upload(credentials, [video1], { headless: true }).then(console.log)
}
