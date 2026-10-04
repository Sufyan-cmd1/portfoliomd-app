require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

console.log('--- MongoDB Connection Diagnostic ---');
const uri = process.env.MONGODB_URI;
console.log('URI provided:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'NONE');

if (!uri) {
  console.error('❌ MONGODB_URI is not set in .env');
  process.exit(1);
}

// Extract hostname
const match = uri.match(/@([^/?]+)/);
const host = match ? match[1] : null;
console.log('Extracted Host:', host);

if (host) {
  const srvDomain = `_mongodb._tcp.${host}`;
  console.log('Testing SRV DNS lookup for:', srvDomain);
  
  // Test with default DNS
  dns.resolveSrv(srvDomain, (err, addresses) => {
    if (err) {
      console.log('System DNS lookup failed:', err.code, err.message);
      
      // Try with Google DNS
      dns.setServers(['8.8.8.8', '8.8.4.4']);
      dns.resolveSrv(srvDomain, (err2, addresses2) => {
        if (err2) {
          console.log('Google DNS (8.8.8.8) lookup also failed:', err2.code, err2.message);
          console.log('\n🔍 DIAGNOSIS: The hostname does not exist in DNS.');
          console.log('This usually means:');
          console.log('1. The MongoDB Atlas cluster is PAUSED due to inactivity in Atlas dashboard (cloud.mongodb.com).');
          console.log('2. The cluster was deleted or recreated with a new connection string.');
          console.log('3. There is a typo in the hostname (e.g. cluster name or hash).');
        } else {
          console.log('✅ Google DNS successfully resolved SRV addresses:', addresses2);
        }
        attemptMongoConnect();
      });
    } else {
      console.log('✅ System DNS resolved addresses:', addresses);
      attemptMongoConnect();
    }
  });
} else {
  attemptMongoConnect();
}

function attemptMongoConnect() {
  console.log('\nAttempting mongoose.connect()...');
  mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 })
    .then(() => {
      console.log('✅ Connected to MongoDB successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Mongoose connection failed:', err.message);
      process.exit(1);
    });
}
