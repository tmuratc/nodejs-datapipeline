// pubsubClient.js
const { PubSub } = require('@google-cloud/pubsub');
require('dotenv').config(); 

// Initialize PubSub client
const pubsub = new PubSub({
  keyFilename: process.env.GCP_CREDENTIALS_KEY_PATH, 
});


async function publishBulk(topicName, logs) {
  const messages = logs.map(log => ({
    data: Buffer.from(JSON.stringify(log)),  // Data must be in Buffer format
  }));
  try {
      // Publish the batch of messages to the Pub/Sub topic
      await pubsub.topic(topicName).publishMessage({"data": Buffer.from(JSON.stringify(logs))});
      console.log(`Published ${logs.length} logs as bulk.`);
      return []; // Return an empty array indicating no logs failed
  } catch (error) {
      console.error('Bulk publish failed:', error);
      // If publishing fails, return all logs as failed
      return logs;
  }
}

module.exports = publishBulk;
