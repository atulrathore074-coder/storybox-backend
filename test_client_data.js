const axios = require('axios');

async function test() {
  const userId = '6aba9c263934ee25f6609f6e';
  const headers = { key: '5TIvw5cpc0' };
  
  // 1. fetchMoviesSeries
  const res1 = await axios.get('http://192.168.29.168:5000/api/client/movieSeries/fetchMoviesSeries', { headers });
  console.log('1. Banners count:', res1.data.data ? res1.data.data.length : 0);
  if (res1.data.data) {
    res1.data.data.forEach(s => console.log('   Banner:', s.name, '->', s.banner));
  }

  // 2. getTrendingMoviesSeries
  const resTrending = await axios.get('http://192.168.29.168:5000/api/client/movieSeries/getTrendingMoviesSeries?userId=' + userId, { headers });
  console.log('2. Trending shows count:', resTrending.data.videos ? resTrending.data.videos.length : 0);
  if (resTrending.data.videos) {
    resTrending.data.videos.forEach(v => console.log('   Trending:', v.name));
  }

  // 3. fetchNewReleasesForUser
  const res3 = await axios.get('http://192.168.29.168:5000/api/client/movieSeries/fetchNewReleasesForUser?userId=' + userId, { headers });
  console.log('3. New Releases count:', res3.data.videos ? res3.data.videos.length : 0);
  if (res3.data.videos) {
    res3.data.videos.forEach(v => console.log('   New Release:', v.name));
  }

  // 4. retrieveMovieSeriesVideosForUser for show 1
  const seriesId = res1.data.data[0]._id;
  const res4 = await axios.get('http://192.168.29.168:5000/api/client/shortVideo/retrieveMovieSeriesVideosForUser?movieSeriesId=' + seriesId + '&userId=' + userId, { headers });
  console.log('4. Show 1 Data:', res4.data.data ? res4.data.data.movieSeriesName : 'No data');
  if (res4.data.data && res4.data.data.videos) {
    console.log('   Total episodes in response:', res4.data.data.videos.length);
    res4.data.data.videos.forEach(e => console.log('   - Ep', e.episodeNumber, 'URL:', e.videoUrl, 'Thumbnail:', e.videoImage));
  }

  // 5. retrieveMovieSeriesVideosForUser for show 2
  const seriesId2 = res1.data.data[1]._id;
  const res5 = await axios.get('http://192.168.29.168:5000/api/client/shortVideo/retrieveMovieSeriesVideosForUser?movieSeriesId=' + seriesId2 + '&userId=' + userId, { headers });
  console.log('5. Show 2 Data:', res5.data.data ? res5.data.data.movieSeriesName : 'No data');
  if (res5.data.data && res5.data.data.videos) {
    console.log('   Total episodes in response:', res5.data.data.videos.length);
    res5.data.data.videos.forEach(e => console.log('   - Ep', e.episodeNumber, 'URL:', e.videoUrl, 'Thumbnail:', e.videoImage));
  }
}

test().catch(err => console.error(err.response ? err.response.data : err.message));
