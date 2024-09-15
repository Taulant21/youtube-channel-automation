const axios = require("axios");

module.exports = { getVideoClips };

async function getVideoClips({ Clips }) {
  let videoLinks = [];

  for (let i = 0; i < Clips.length; i++) {
    const id = Clips[i].id;

    let data = JSON.stringify([
      {
        operationName: "VideoAccessToken_Clip",
        variables: {
          platform: "web",
          slug: id,
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              "6fd3af2b22989506269b9ac02dd87eb4a6688392d67d94e41a6886f1e9f5c00f",
          },
        },
      },
    ]);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://gql.twitch.tv/gql",
      headers: {
        accept: "*/*",
        "accept-language": "en-US",
        "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios.request(config); 

      const clip = response.data[0].data.clip;
      const sourceURL = clip.videoQualities[0].sourceURL;
      const signature = clip.playbackAccessToken.signature;
      const value = clip.playbackAccessToken.value;

 
      const videoLink = `${sourceURL}?sig=${signature}&token=${encodeURIComponent(
        value
      )}`;

      videoLinks.push(videoLink); 
    } catch (error) {
      console.log(error); 
    }
  }

  return videoLinks; 
}
