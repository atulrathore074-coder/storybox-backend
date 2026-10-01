const axios = require('axios');
const mongoose = require('mongoose');
const MovieSeries = require('./models/movieSeries.model');
const ShortVideo = require('./models/shortVideo.model');
const Category = require('./models/category.model');

function decodeHtml(html) {
  return html
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/‘/g, "'")
    .replace(/’/g, "'");
}

async function seedShortical() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/storybox');
  console.log('MongoDB connected.');

  // Fetch categories
  const categories = await Category.find().lean();
  console.log('Available categories:', categories.map(c => c.name));
  const catMap = {};
  categories.forEach(c => {
    catMap[c.name.toLowerCase()] = c._id;
  });

  const defaultCatId = categories[0]?._id;

  // Clear existing MovieSeries and ShortVideos to clean out dummy data
  console.log('Clearing old movieseries and shortvideos...');
  await MovieSeries.deleteMany({});
  await ShortVideo.deleteMany({});
  console.log('Collections cleared.');

  // Fetch sitemap
  console.log('Fetching Shortical series sitemap...');
  const sitemapRes = await axios.get('https://shortical.com/sitemaps/series.xml', { timeout: 15000 });
  const urls = (sitemapRes.data.match(/<loc>(https:\/\/shortical\.com\/drama\/[^<]+)<\/loc>/g) || [])
    .map(u => u.replace('<loc>', '').replace('</loc>', ''));

  console.log(`Found ${urls.length} drama series on Shortical. Seeding top 10 series...`);

  const dramasToSeed = urls.slice(0, 10);
  let totalEpisodesSeeded = 0;
  let seriesIndex = 0;

  for (const dramaUrl of dramasToSeed) {
    try {
      seriesIndex++;
      const dramaIdMatch = dramaUrl.match(/-(\d+)$/);
      if (!dramaIdMatch) continue;
      const dramaId = dramaIdMatch[1];

      console.log(`\n[${seriesIndex}/10] Fetching details for drama ID ${dramaId}: ${dramaUrl}`);
      const res = await axios.get(dramaUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
      const html = res.data;

      // Extract title
      const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i) || html.match(/<title>([^<]+)<\/title>/i);
      let title = titleMatch ? titleMatch[1].trim() : dramaUrl.split('/').pop().replace(/-\d+$/, '').replace(/-/g, ' ');
      title = decodeHtml(title.replace(/\s*\|\s*Shortical.*$/i, '').trim());

      // Extract description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) || 
                        html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      let description = descMatch ? descMatch[1] : 'Popular short drama web series streaming on Shortical.';
      description = decodeHtml(description);

      // Determine category
      let matchedCatId = defaultCatId;
      const descLower = description.toLowerCase();
      if (descLower.includes('billionaire') && catMap['billionaire']) {
        matchedCatId = catMap['billionaire'];
      } else if (descLower.includes('romance') && catMap['romance']) {
        matchedCatId = catMap['romance'];
      } else if (descLower.includes('revenge') && catMap['revenge']) {
        matchedCatId = catMap['revenge'];
      } else if (descLower.includes('suspense') && catMap['suspense']) {
        matchedCatId = catMap['suspense'];
      } else if (descLower.includes('fantasy') && catMap['fantasy']) {
        matchedCatId = catMap['fantasy'];
      } else if (catMap['drama']) {
        matchedCatId = catMap['drama'];
      }

      // Find all episodes
      const fillerMatches = html.match(new RegExp(`/${dramaId}/(\\d+)/filler\\.webp`, 'g')) || [];
      const epNums = [...new Set(fillerMatches.map(m => {
        const parts = m.split('/');
        return parseInt(parts[2], 10);
      }))].sort((a, b) => a - b);

      if (epNums.length === 0) {
        console.log(`No episodes found for drama ${dramaId}, skipping.`);
        continue;
      }

      const posterUrl = `https://dirjqbe1kaah2.cloudfront.net/${dramaId}/image.webp`;
      const bannerUrl = `https://dirjqbe1kaah2.cloudfront.net/${dramaId}/image.webp`;

      // Create MovieSeries
      const movieSeries = await MovieSeries.create({
        name: title,
        description: description,
        category: matchedCatId,
        banner: bannerUrl,
        thumbnail: posterUrl,
        type: 2, // WebSeries
        isTrending: seriesIndex <= 6, // Top 6 trending
        isAutoAnimateBanner: seriesIndex <= 4, // Top 4 in banner carousel
        isActive: true,
        maxAdsForFreeView: 0,
        releaseDate: new Date(Date.now() - seriesIndex * 86400000), // Staggered release dates
      });

      console.log(`Created MovieSeries: "${title}" (ID: ${movieSeries._id}) with ${epNums.length} episodes`);

      // Prepare episodes
      const episodeDocs = epNums.map(epNum => ({
        movieSeries: movieSeries._id,
        episodeNumber: epNum,
        videoImage: `https://dirjqbe1kaah2.cloudfront.net/${dramaId}/${epNum}/filler.webp`,
        videoUrl: `https://dirjqbe1kaah2.cloudfront.net/${dramaId}/${epNum}/video.m3u8`,
        duration: 90,
        coin: 0,
        isLocked: false, // Free to watch directly!
        releaseDate: new Date(),
      }));

      await ShortVideo.insertMany(episodeDocs);
      totalEpisodesSeeded += episodeDocs.length;
      console.log(`  -> Inserted ${episodeDocs.length} episodes for "${title}"`);

    } catch (err) {
      console.error(`Error processing drama ${dramaUrl}:`, err.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`SUCCESS! Seeded ${seriesIndex} Shortical Drama series and ${totalEpisodesSeeded} total episodes.`);
  console.log(`========================================`);

  await mongoose.disconnect();
}

seedShortical().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
