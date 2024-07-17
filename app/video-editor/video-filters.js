module.exports = { getVideoFilters }

const formatTime = (totalSeconds) => {
    totalSeconds = Math.floor(totalSeconds); 
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

function getVideoFilters({ videosList, durations }) {
    const videoFilters = []
    const audioFilters = []
    const concatVideoInputs = []
    const concatAudioInputs = []
    const streamerCredits = []
    const youtubeChapters = []

    let totalSeconds = 0

    videosList.forEach((file, index) => {
        const fadeOutStart = durations[index] - 1
        const fadeInStart = 0

        const name = file.split('__')[1].replace(
          '.mp4',
          ''
        )
        const streamerName = `Twitch - twitch.tv/${name}`

        streamerCredits.push(`https://twitch.tv/${name}`)

        // Add fade in and fade out for each video and audio stream
        videoFilters.push({
            filter: 'fade',
            options: `t=out:st=${fadeOutStart}:d=1`,
            inputs: `${index}:v`,
            outputs: `v${index}o`
        })

        videoFilters.push({
            filter: 'fade',
            options: `t=in:st=${fadeInStart}:d=1`,
            inputs: `v${index}o`,
            outputs: `v${index}`
        })

        videoFilters.push({
            filter: 'drawtext',
            options: `text='${streamerName}':x=25:y=100:fontsize=40:fontcolor=white:box=1:boxcolor=black@0.5:borderw=10`,
            inputs: `v${index}`,
            outputs: `v${index}_with_text`
        })

        audioFilters.push({
            filter: 'afade',
            options: `t=out:st=${fadeOutStart}:d=1`,
            inputs: `${index}:a`,
            outputs: `a${index}o`
        })

        audioFilters.push({
            filter: 'afade',
            options: `t=in:st=${fadeInStart}:d=1`,
            inputs: `a${index}o`,
            outputs: `a${index}`
        })

        // Collect inputs for concatenation
        concatVideoInputs.push(`v${index}_with_text`);
        concatAudioInputs.push(`a${index}`);

        // Calculate and store YouTube chapter
        const formattedTime = formatTime(totalSeconds);
        youtubeChapters.push(`${formattedTime} ${name}`);
        totalSeconds += durations[index];
    });

    const videoConcatFilter = {
        filter: 'concat',
        options: {
            n: videosList.length,
            v: 1,
            a: 0
        },
        inputs: concatVideoInputs,
        outputs: 'v'
    }
    const audioConcatFilter = {
        filter: 'concat',
        options: {
            n: videosList.length,
            v: 0,
            a: 1
        },
        inputs: concatAudioInputs,
        outputs: 'a'
    }

    youtubeChapters.forEach(chapter => console.log(chapter));

    return { videoFilters, audioFilters, videoConcatFilter, audioConcatFilter, streamerCredits , youtubeChapters };
}
