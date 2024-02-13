// Sample data representing artists, albums, songs, and genres
const artists = [
    { id: 1, name: 'Artist 1' },
    { id: 2, name: 'Artist 2' }
];
  
const albums = [
    { id: 1, title: 'Album 1', artistId: 1 },
    { id: 2, title: 'Album 2', artistId: 2 }
];
  
const songs = [
    { id: 1, title: 'Song 1', albumId: 1, genreId: 1 },
    { id: 2, title: 'Song 2', albumId: 1, genreId: 2 },
    { id: 3, title: 'Song 3', albumId: 2, genreId: 1 },
    { id: 4, title: 'Song 4', albumId: 2, genreId: 2 }];

const genres = [
    { id: 1, name: 'Genre 1' },
    { id: 2, name: 'Genre 2' }
];
  
function mapSongsToAlbum(albums, songs, genres) {
    return albums.map(album => ({
        id: album.id,
        title: album.title,
        songs: songs
            .filter(song => song.albumId === album.id)
            .map(song => mapSong(song, genres))
    }));
}
  
function mapSong(song, genres) {
    return {
      id: song.id,
      title: song.title,
      genre: genres.find(genre => genre.id === song.genreId)
    };
}
  
function mapGenresToSongs(genres, songs, albums) {
    return genres.map(genre => ({
        id: genre.id,
        name: genre.name,
        songs: songs
            .filter(song => song.genreId === genre.id)
            .map(song => mapSongWithAlbum(song, albums))
    }));
}
  
function mapSongWithAlbum(song, albums) {
    const album = albums.find(album => album.id === song.albumId);
    return {
        id: song.id,
        title: song.title,
        album: {
            id: album.id,
            title: album.title
        }
    };
}
  
const jsonData = {
    artists: artists.map(artist => ({
        id: artist.id,
        name: artist.name,
        albums: mapSongsToAlbum(
            albums.filter(album => album.artistId === artist.id),
            songs,
            genres
        )
    })),
    genres: mapGenresToSongs(genres, songs, albums)
};
  
// Convert the JavaScript object to JSON string
const jsonString = JSON.stringify(jsonData, null, 2);
  
// Output the JSON string
console.log(jsonString);