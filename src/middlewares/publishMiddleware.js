require('dotenv').config() 
const topicName = process.env.TOPIC_NAME
const BATCH_SIZE = process.env.BATCH_SIZE

const logStore = require('../utils/logStore');
const publishBulk = require('../gcp/pubsub'); 

const { Mutex } = require('async-mutex');
const failedLogsMutex = new Mutex();
const logQueueMutex = new Mutex(); 

const initialBulkPublish = async (req, res, next) => {
    try {
        await logQueueMutex.runExclusive(async () => {
            const logQueue = logStore.getLogQueue();
            if (logQueue.length < BATCH_SIZE) { 
                console.log(`Batch job is waiting ${BATCH_SIZE - logQueue.length} more log to run...`) ;
                next()
            }
            else {
                const batchLogs = logQueue.splice(0, BATCH_SIZE);
                console.log('Batch job is running.');
                const failedLogs = await publishBulk(topicName, batchLogs);
                await failedLogsMutex.runExclusive(() => {
                    logStore.addFailedLogs(failedLogs);
                    });

                next(); 
            } 
        }); 
        
    } catch (error) {
        next(error);  
    }
};

module.exports = initialBulkPublish;
