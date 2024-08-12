require('dotenv').config()
const BATCH_DIVISION = process.env.BATCH_DIVISION || 4 
const BATCH_SIZE = process.env.BATCH_SIZE || 1000

const logStore = require('../utils/logStore');
const publishBulk = require('../gcp/pubsub'); 

const { Mutex } = require('async-mutex');
const failedLogsMutex = new Mutex();
const persistenFailuresMutex = new Mutex() ;


const handleFails = async (req,res,next) => {
    try {
        await failedLogsMutex.runExclusive(async () => {
            const failedLogs = logStore.getFailedLogs();
            console.log(`Number of logs in failed queue: ${failedLogs.length}`)
            if (failedLogs.length > Math.floor(BATCH_SIZE/BATCH_DIVISION)) {
                const failedLogsBatch = failedLogs.splice(0, Math.floor(BATCH_SIZE/BATCH_DIVISION));
                const persistentFailures = await publishBulk(topicName, failedLogsBatch); 
                await persistenFailuresMutex.runExclusive( async () => { 
                    logStore.addPersistentFailures(persistentFailures);
                })
            }
            next()
        })
    } catch (error) {
        next(error);
    }
    
};

module.exports = handleFails;
