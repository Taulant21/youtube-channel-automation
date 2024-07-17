const ffmpeg = require('fluent-ffmpeg')

const { getVideoFilters } = require('./video-filters')

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

module.exports = { mergeVideos }

async function mergeVideos({ videosList, videosBaseUrl }) {
  let filteredVideos = await filterVideosBasedOnResolution({
    videos: videosList,
    videosBaseUrl
  })

  // Sort based on clip-views
  const sortedVideos = filteredVideos.sort(
    (a, b) => +b.split('__')[0] - +a.split('__')[0]
  )

  const durations = await Promise.all(
    sortedVideos.map((videoName) =>
      getVideoDuration(`${videosBaseUrl}${videoName}`)
    )
  )

  const videoDurationSeconds = durations.reduce((a, b) => a + b, 0)

  // Get the video filters(fade in/out effects - video/audio)
  const filters = getVideoFilters({ videosList: sortedVideos, durations })

  const applyAllVideosInput = () => {
    let ffmpegCommand = ffmpeg()

    for (let i = 0; i < sortedVideos.length; i++) {
      ffmpegCommand.input(`${videosBaseUrl}${sortedVideos[i]}`)
    }

    return ffmpegCommand
  }

  return new Promise((resolve, reject) => {
    console.log('Started Merging Videos...')

    applyAllVideosInput()
      .complexFilter([
        ...filters.videoFilters,
        ...filters.audioFilters,
        filters.videoConcatFilter,
        filters.audioConcatFilter
      ])
      .outputOptions([
        '-map',
        '[v]',
        '-map',
        '[a]',
        '-c:v',
        // Uses Nvidia (GPU) nvenc for encoding, which is faster based on your GPU
        'h264_nvenc',
        '-c:a',
        'aac'
      ])
      .on('progress', function (progress) {
        if(progress.frames > 0) {
          const minutes = videoDurationSeconds

          const timeMark = progress.timemark.split(/:|\./)
          
          const currentSeconds = parseInt(timeMark[1]) * 60 + parseInt(timeMark[2])
  
          const diff = minutes - currentSeconds
  
          const currentProgress = 100 - parseInt((diff / minutes) * 100)
  
          console.log(`Merging Progress -> ${currentProgress}%`);
  
        }
      })
      .output('output.mp4')
      .on('end', () => {
        console.log('Videos merged successfully!')

        resolve({
          status: 200,
          success: true,
          credits: filters.streamerCredits,
          youtubechapters : filters.youtubeChapters
        })
      })
      .on('error', (err) => {
        console.error('Error merging videos:', err.message)

        reject({
          status: 500,
          success: false
        })
      })
      .run()
  })
}

function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err)
      } else {
        resolve(metadata.format.duration)
      }
    })
  })
}

// Only get full HD videos
async function filterVideosBasedOnResolution({ videos, videosBaseUrl }) {
  const isFullHDVideo = ({ videoPath }) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error(err)
          reject(false)
        } else {
          resolve(
            metadata.streams[0].width === 1920 &&
              metadata.streams[0].height === 1080
          )
        }
      })
    })
  }

  const sortedVideos = await Promise.all(
    videos.map(async (video) => {
      if (await isFullHDVideo({ videoPath: `${videosBaseUrl}${video}` })) {
        return video
      }
    })
  )

  return sortedVideos.filter(Boolean)
}
