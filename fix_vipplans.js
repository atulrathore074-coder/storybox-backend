const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/storybox');
  const db = mongoose.connection;
  const plans = await db.collection('vipplans').find().toArray();
  for (const p of plans) {
    const update = {
      $set: {
        price: Math.round(p.price || 0),
        offerPrice: Math.round(p.offerPrice || 0)
      }
    };
    await db.collection('vipplans').updateOne({ _id: p._id }, update);
  }
  console.log('Fixed VIP plans in MongoDB to integer prices!');
  process.exit(0);
}

fix();
