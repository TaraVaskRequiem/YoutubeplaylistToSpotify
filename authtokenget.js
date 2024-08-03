//#region const
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
const port = 8888;



const client_id = config.spotifyClientId; // Your client id
const client_secret = config.spotifyClientSecret; // Your secret
const redirect_uri = config.spotifyRedirectUri; // Your redirect uri
//#endregion
//#region login
app.get('/login', (req, res) => {
    const scope = 'user-read-playback-state user-read-currently-playing';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri
      }));
  });
  //#endregion
//#region callback
  app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      json: true
    };
  //#endregion
//#region token

    try {
      const response = await axios(authOptions);
      const access_token = response.data.access_token;
      res.send('Access token: ' + access_token);
    } catch (error) {
      console.error('Error retrieving access token:', error.response ? error.response.data : error.message);
      res.send('Error retrieving access token: ' + (error.response ? error.response.data : error.message));
    }
  });
  //#endregion
//#region listen
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
   //#endregion