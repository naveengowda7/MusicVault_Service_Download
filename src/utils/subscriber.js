import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: "hVsuxkFLreWnHflApANxVpB8vcwjZHD2",
  socket: {
    host: "redis-14273.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14273,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));
await client.connect();

const subscribeToYouTubeLinks = async (channel, callback) => {
  try {
    await client.subscribe(channel, (message) => {
      console.log(`Received message on ${channel}: ${message}`);
      callback(JSON.parse(message));
    });
    console.log(`Subscribed to ${channel}`);
  } catch (error) {
    console.error("Failed to subscribe:", error);
  }
};

export { subscribeToYouTubeLinks };
