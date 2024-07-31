



//#region const
const axios = require('axios');
const querystring = require('querystring');
const readline = require('readline');
const fs = require('fs');
 //#endregion
//#region Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const YOUTUBE_API_KEY = config.youtubeApiKey;
const SPOTIFY_CLIENT_ID = config.spotifyClientId;
const SPOTIFY_CLIENT_SECRET = config.spotifyClientSecret;
const SPOTIFY_REDIRECT_URI = config.spotifyRedirectUri;
//#endregion 
//#region Helper function to prompt user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}
//#endregion
//#region Step 1: Get YouTube playlist videos
async function getYoutubePlaylistVideos(playlistId) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
    const response = await axios.get(url);

    if (response.data.items) {
      return response.data.items.map(item => item.snippet.title);
    } else {
      throw new Error('No items found in the playlist.');
    }
  } catch (error) {
    console.error('Error fetching YouTube playlist videos:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}
//#endregion
//#region Step 2: Authenticate with Spotify and get an access token
async function getSpotifyAccessToken() {
  const { default: open } = await import('open');

  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: 'playlist-modify-public playlist-modify-private',
  })}`;

  console.log('Opening browser for Spotify authentication...');
  await open(authUrl);

  const authCode = await askQuestion('Enter the code from Spotify: ');

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return tokenResponse.data.access_token;
  } catch (error) {
    console.error('Error obtaining Spotify access token:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}
//#endregion
//#region Step 3: Create a new Spotify playlist
async function createSpotifyPlaylist(accessToken, playlistName) {
  try {
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userId = userResponse.data.id;

    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return playlistResponse.data.id;
  } catch (error) {
    console.error('Error creating Spotify playlist:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}
//#endregion
//#region Step 4: Search for tracks on Spotify and add them to the playlist
async function addTracksToSpotifyPlaylist(accessToken, playlistId, tracks) {
  const trackUris = [];

  for (const track of tracks) {
    try {
      const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          q: track,
          type: 'track',
          limit: 1,
        },
      });

      if (searchResponse.data.tracks.items.length > 0) {
        trackUris.push(searchResponse.data.tracks.items[0].uri);
      } else {
        console.warn(`Track not found on Spotify: ${track}`);
      }
    } catch (error) {
      console.error(`Error searching for track on Spotify: ${track}`, error.response ? error.response.data : error.message);
    }
  }

  if (trackUris.length > 0) {
    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: trackUris,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error adding tracks to Spotify playlist:', error.response ? error.response.data : error.message);
      process.exit(1);
    }
  } else {
    console.warn('No tracks to add to the Spotify playlist.');
  }
}
//#endregion
//#region Main function
async function main() {
  const playlistId = await askQuestion('Enter the YouTube playlist ID: ');
  const playlistName = await askQuestion('Enter a name for the new Spotify playlist: ');

  const youtubeVideos = await getYoutubePlaylistVideos(playlistId);
  const spotifyAccessToken = await getSpotifyAccessToken();
  const spotifyPlaylistId = await createSpotifyPlaylist(spotifyAccessToken, playlistName);

  await addTracksToSpotifyPlaylist(spotifyAccessToken, spotifyPlaylistId, youtubeVideos);

  console.log('Playlist created successfully!');
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
});
//#endregion