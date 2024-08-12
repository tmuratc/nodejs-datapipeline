let logQueue = [];
let failedLogs = [];
let persistentFailures = [];

module.exports = {
    getLogQueue: () => logQueue,
    getFailedLogs: () => failedLogs,
    getPersistentFailures: () => persistentFailures,
    addLogs: (logs) => logQueue.push(...logs),
    addFailedLogs: (logs) => failedLogs.push(...logs),
    addPersistentFailures: (logs) => persistentFailures.push(...logs),
    clearLogs: () => { logQueue = []; failedLogs = []; }
};
