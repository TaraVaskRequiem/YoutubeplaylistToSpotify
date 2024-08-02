# Youtube Playlist to spotify

This repository allows you too get a youtube playlist you have made ir have the id to and turn it inot a spotify playlist.


## Installation

1. follow this tutorial to get your **[youtube api key](https://www.youtube.com/watch?v=2HRtQhj4HoQ&embeds_referring_euri=https%3A%2F%2Fwww.bing.com%2F&embeds_referring_origin=https%3A%2F%2Fwww.bing.com&source_ve_path=Mjg2NjY)** 
2. to set up your spotify api goto **[spotify api](https://developer.spotify.com/dashboard)**
3. sign in
4. creat an app
5. fill out all the info thats required(ie. name, description, etc)
6. add this as the callback address http://localhost:8888/callback
7. copy the client id and client secret too config.js


## Disclaimer

* This is a third-party modification for spotify and youtube.  It's important to use it responsibly and at your own risk.
* i havent set up requirements.txt right so dont try and download the dependents from itjust download them manually for now :p


##Common Error(s)

if you recieve this error it means the youtube playlist is private and you need to public it or get the owner to public it.

//#region Error
Error fetching YouTube playlist videos: {
  error: {
    code: 404,
    message: "The playlist identified with the request's <code>playlistId</code> parameter cannot be found.",
    errors: [ [Object] ]
  }
}

this means the youtube playlist is private and you need to public it or get the owner to public it.

//#endregion
