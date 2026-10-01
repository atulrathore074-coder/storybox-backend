const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const localUri = 'mongodb://127.0.0.1:27017/storybox';
const atlasUri = 'mongodb+srv://atulrathore074_db_user:Storybox12345@cluster0.p6vzfp4.mongodb.net/storybox?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('1. Connecting to local MongoDB...');
  const localConn = await mongoose.createConnection(localUri).asPromise();
  console.log('   Connected to local MongoDB.');

  console.log('2. Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(atlasUri).asPromise();
  console.log('   Connected to MongoDB Atlas!');

  const collections = await localConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in local MongoDB.`);

  for (const collInfo of collections) {
    const collName = collInfo.name;
    if (collName.startsWith('system.')) continue;

    console.log(`\nMigrating collection: "${collName}"...`);
    const localColl = localConn.db.collection(collName);
    const atlasColl = atlasConn.db.collection(collName);

    const docs = await localColl.find({}).toArray();
    console.log(`   Read ${docs.length} documents from local "${collName}".`);

    if (docs.length > 0) {
      // Clear atlas collection first
      await atlasColl.deleteMany({});
      // Insert into atlas
      await atlasColl.insertMany(docs);
      console.log(`   ✅ Successfully migrated ${docs.length} documents to Atlas "${collName}".`);
    } else {
      console.log(`   Collection is empty, skipped.`);
    }
  }

  console.log('\n======================================================');
  console.log('🎉 ALL DATA MIGRATED TO MONGODB ATLAS SUCCESSFULLY!');
  console.log('======================================================');

  await localConn.close();
  await atlasConn.close();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
