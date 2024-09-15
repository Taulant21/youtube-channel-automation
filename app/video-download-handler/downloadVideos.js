const https = require('https')
const fs = require('fs')

module.exports = { downloadClips }

async function downloadClips({ clips , videoLink }) {
  for (let i = 0; i < videoLink.length; i++) {
    await new Promise((resolve, reject) => {
      https.get(videoLink[i], async (res) => {
        const fileStream = fs.createWriteStream(
          `${__dirname}/videos/${clips[i].view_count}__${clips[i].broadcaster_name.toLowerCase()}.mp4`
        )
        res.pipe(fileStream)

        fileStream.on('finish', async () => {
          fileStream.close()
          resolve(console.log(`Clip Number ${i + 1} Finished Downloading`))
        })
      })
    })
  }

  return console.log('All Clips Were Downloaded!')
}
