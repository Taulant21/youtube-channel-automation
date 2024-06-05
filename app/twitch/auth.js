const axios = require('axios')

module.exports = { getTwitchAuthToken }

async function getTwitchAuthToken() {
  const accessTokenResponse = await axios.post(
    process.env.TWITCH_ACCESS_TOKEN_API_URL,
    null,
    {
      params: {
        client_id: process.env.TWITCH_APP_CLIENT_ID,
        client_secret: process.env.TWITCH_APP_CLIENT_SECRET,
        grant_type: 'client_credentials'
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  return accessTokenResponse?.data?.access_token
}