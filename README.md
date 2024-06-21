# Youtube Automation

This project intends to achieve a complete automatization of a youtube channel regarding posting daily highlights of league of legends content
The content itself will be fetched from the twitch api

### Setup env vars

```
cp .env.sample .env
```

### Install dependencies

```
npm install
```

### Token Requirements
Get google console credentials and also a refresh token and put them on the dir below

How to acquire credentials: https://developers.google.com/workspace/guides/create-credentials

How to acquire a refreshToken: https://developers.google.com/identity/protocols/oauth2

app/youtube-uploader/token.json

app/youtube-uploader/credentials.json

## Starting the project

```
npm start
```

### Results
Check out the league videos generated through this script
https://www.youtube.com/@SnApLeague
