## Description
This is a Node.js express app as a data pipeline backend web service. It will designed to response following;
 - Post Request will paste json event logs to BigQuery table.
 - Get Request will return a summary result from BigQuery table.
 - Service is designed to have data life cycle as;
   - Post Request(./logs) -> Pub/Sub -> BigQuery Table -> Get Request (./analytics)

However there is no setup configuration for GCP services in the repository. Therefore following prerequisites are required.

## Prerequisites
 - BigQuery Table
 - Pub/Sub Topic
 - Service Account with following roles;
   - BigQuery Data Editor
   - BigQuery Data Transfer Service Agent
   - Pub/Sub Admin
   - Key Json file
   
Note: To get complete data life cycle data proccessing operation (from Pub/Sub to BQ) must be set. Code doesn't provide it. 

## Usage 
To clone this repo 
```bash
git clone https://github.com/tmuratcamli/datapipeline-nodejs-gcp.git
````
Update .env file with corresponding values. 

To run app 
```bash
npm start
````


### POST REQUEST 
- Service is designed to handle high traffic without single loss of logs. 
- Approach: Server keeps 3 different arrays to handle logs; logQueue, failedLogs, persistentFailures. 
- Functionality of each middleware in order ;

#### validateSchema
- Reqeust.body objects are compiled to compare defined schema in ./models/schema.json.
- The mismatched schemas are not added to logQueue. 

#### addToQueue
 - Matched logs are pushed to logQueue.

#### initialBulkPublish
 - Publishing bulk with first N elements of logQueue. To set size -> .env BATCH_SIZE 
 - Failed batches are pushed to failedLogs array.

#### handleFails
 - PublishİNG bulk with smaller batch sizes. To set ratio -> .env BATCH_SIZE_DIVISION  
 - Failed batches are pushed to persistenFailures.

#### handlePersistentFails;
 - Publishing bulk with backoff and retry mechanism.
 - To set -> .env MAX_BATCH_SIZE, BACKOFF_BASE_DELAY, MAX_BACKOFF_DELAY, MAX_RETRY
 - Failed logs stay in the array.


## GET REQUEST
- Running the defined queries in ./scripts/getQueries as BigQuery client.

## NOTES
- As it is said before this project doesn't provide data proccesing for from Pub/Sub to BQ operation. 
- To get complete data life cycle DataFlow, Cloud Functions, Cloud Run services can be considered.
- This project can be adapted to different use cases by modifying ./models/scjema.json and scripts/getQueries.js files.
