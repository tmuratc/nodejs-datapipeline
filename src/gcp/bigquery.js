const { BigQuery } = require('@google-cloud/bigquery');
const {dailyStats, totalUsers, dailyStatsExceptToday} = require('../scripts/getQueries')
const {getStatusMessage} = require('../middlewares/schemaValidationMiddleware')
require('dotenv').config();

const bigQueryClient = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_CREDENTIALS_KEY_PATH,
});

const getSummaryQueryResults = async (req,res,next) => {
  try {
    const [dailyStatsRows] = await bigQueryClient.query(dailyStats);
    const [totalUsersRows] = await bigQueryClient.query(totalUsers);
    const formattedRows = dailyStatsRows.map(row => ({
      ...row,
      date: row.date.value // Extract the value field from the date
  }));
    dailySummary = {
                    "total_users" : totalUsersRows[0]["total_users"], 
                    "daily_stats" : formattedRows 
                  };
    console.log(dailySummary)
    res.json(dailySummary);
  } catch (error) { 
    next(error); 
  }
}

module.exports = getSummaryQueryResults;
