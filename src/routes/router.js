const express = require('express');
const validateSchema = require('../middlewares/schemaValidationMiddleware');
const addToQueue = require('../middlewares/logMiddleware');
const initialBulkPublish = require('../middlewares/publishMiddleware');
const handleFails = require('../middlewares/handleFailsMiddleware');
const handlePersistentFails = require('../middlewares/handlePersistentFailsMiddleware');
const getSummaryQueryResults = require('../gcp/bigquery');

const Router = express.Router();

Router.get('/analytics', getSummaryQueryResults, (req, res) => {
    next()
})

Router.post('/logs', validateSchema, addToQueue, initialBulkPublish, handleFails, handlePersistentFails, (req, res) => {
    res.status(200).send('Logs processed successfully');
})

module.exports = { Router };