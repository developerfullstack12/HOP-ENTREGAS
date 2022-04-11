const mongoose = require('mongoose');
mongoose.connect(process.env.DB_AUTH_URL, {
  keepAlive: 1,
  useUnifiedTopology: true,
  useNewUrlParser: true
});
mongoose.connection.on('error', (err) => {
  console.log('err', err);
  throw err;
});

 mongoose.connection.on('connected', () => {
  console.log('mongoose is connected');
});
module.exports = mongoose;
