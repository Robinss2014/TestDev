define(function(require, exports, module) {

//////////////////////////////////////////////////////////////////////////////
// API KEYS / ROUTE DATA
//////////////////////////////////////////////////////////////////////////////
    var API_KEY = "AIzaSyC7OLDeoEaNaqA6RMYw7L-XOXDNKUB9Vsc";
    var QUERY_URL = "https://www.googleapis.com/youtube/v3/playlistItems?";
    var DEFAULT_ID = "PL0bvP7Hupz0S1qXnPVn-Yhr24JK5lVvJQ";
//////////////////////////////////////////////////////////////////////////////

    function YouTubeData(cb, usePlaylistID) {
        usePlaylistID = (usePlaylistID === undefined) ? true : usePlaylistID;

        query = query || 'playlistId'
        var playlistID = getParameterByName(query);

        var PLAYLIST_ID
        if (usePlaylistID) {
            PLAYLIST_ID = (playlistID == "") ? DEFAULT_ID : playlistID;
        } else {
            PLAYLIST_ID = DEFAULT_ID;
        }

        var query = QUERY_URL + 'playlistId=' + PLAYLIST_ID + '&maxResults=50&key=' + API_KEY + '&part=snippet,contentDetails';

        var data = [];

        var oReq = new XMLHttpRequest();
        oReq.open("get", query, true);
        oReq.send();

        oReq.onload = function () {
            if (!this.responseText) {
                return YouTubeData(cb, false);
            }

            var responseItems = JSON.parse(this.responseText).items;
            if (!responseItems) {
                return YouTubeData(cb, false);
            }

            for (var i = 0; i < responseItems.length; i++) {
                var item = responseItems[i];
                var snippet = item.snippet;

                if (!snippet.thumbnails) continue;
                data.push({
                    id: item.contentDetails.videoId,
                    title: snippet.title,
                    description: snippet.description,
                    highResThumbURL: (snippet.thumbnails.standard) ? snippet.thumbnails.standard.url : snippet.thumbnails.high.url,
                    thumbURL: snippet.thumbnails.default.url
                });
            }

            cb(data);
            return;
        };
    }

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    module.exports = YouTubeData;
});