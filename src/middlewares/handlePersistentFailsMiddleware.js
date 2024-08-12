require('dotenv').config()
const BACKOFF_BASE_DELAY_MS = process.env.BACKOFF_BASE_DELAY_MS || 1000; // Base delay for backoff strategy in milliseconds
const MAX_BACKOFF_DELAY_MS = process.env.MAX_BACKOFF_DELAY_MS || 60000; // Maximum delay before retrying in milliseconds
const MAX_RETRY = process.env.MAX_RETRY || 3
const MAX_BATCH_SIZE = process.env.MAX_BATCH_SIZE

const logStore = require('../utils/logStore')
const { Mutex } = require('async-mutex');
const persistenFailuresMutex = new Mutex() ;


const handlePersistentFails = async (req, res, next) => {
    try {
        await persistenFailuresMutex.runExclusive(async () => {
            const persistentFailures = logStore.getPersistentFailures();
            
            while (persistentFailures.length > 0) {
                // Define the batch size
                const batchSize = Math.min(persistentFailures.length, MAX_BATCH_SIZE);
                const batchLogs = persistentFailures.splice(0, batchSize);

                console.log(`Processing ${batchLogs.length} persistent failed logs.`);

                let retryCount = 0;
                let success = false;

                while (retryCount < MAX_RETRY && !success) { // 
                    try {
                        const failedLogs = await publishBulk(topicName, batchLogs);
                        if (failedLogs.length === 0) {
                            success = true; // Exit while loop if successful
                        } else {
                            // If there are still failed logs, add them back to persistentFailures
                            logStore.addPersistentFailures(failedLogs);
                        }
                    } catch (error) {
                        console.error('Publish failed:', error);
                        logStore.addPersistentFailures(batchLogs); // Add logs back to persistentFailures
                    }

                    if (!success) {
                        // Calculate exponential backoff delay
                        const delay = Math.min(BACKOFF_BASE_DELAY_MS * Math.pow(2, retryCount), MAX_BACKOFF_DELAY_MS);
                        console.log(`Retrying in ${delay} ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        retryCount++;
                    }
                }

                if (retryCount === 5) {
                    console.error('Max retries reached for batch of persistent failed logs.');
                }
            }
        });
        next(); // Proceed to the next middleware

    } catch (error) {
        next(error); 
    }
};

module.exports = handlePersistentFails;