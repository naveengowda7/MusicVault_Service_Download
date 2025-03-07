const { createClient } = require("redis");

const redisSub = createClient({
  username: "default",
  password: process.env.REDIS_ID,
  socket: {
    host: "redis-10383.crce182.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 10383,
  },
});

redisSub.connect().catch(console.error);

const subscribeToYouTubeLinks = async (channel, callback) => {
  try {
    await redisSub.subscribe(channel, (message) => {
      console.log(`Received message on ${channel}: ${message}`);
      callback(JSON.parse(message));
    });
    console.log(`Subscribed to ${channel}`);
  } catch (error) {
    console.error("Failed to subscribe:", error);
  }
};

module.exports = { subscribeToYouTubeLinks };
