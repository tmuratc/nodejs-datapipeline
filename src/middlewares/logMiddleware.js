const logStore = require('../utils/logStore');
const { Mutex } = require('async-mutex');
const logQueueMutex = new Mutex();

const addToQueue = async (req, res, next) => {
    try {
        if (req.schema === "valid") { 
            const log = req.body;
            await logQueueMutex.runExclusive(() => {
                logStore.addLogs([log]);
                console.log(`Number of logs in the queue: ${logStore.getLogQueue().length}`)
            }) 
        }  
        next();
    
    } catch (error) {
        next(error); 
    }
};

module.exports = addToQueue ;