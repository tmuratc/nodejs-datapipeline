## Description
This is a Node.js express app as a data pipeline backend web service. It will designed to response following;
 - Post Request will paste json event logs to BigQuery table.
 - Get Request will return a summary result from BigQuery table.
 - Service is designed to have data life cycle as;
   - post request -> pub/sub -> dataflow job -> BigQueryTable -> get request

However there is no setup configuration for GCP services in the repository. Therefore following following prerequisites are required.

## Prerequisites
 - BigQuery Table
 - Pub/Sub Topic
 - Dataflow Job
 - Service Account with following roles;
   - BigQuery Data Editor
   - BigQuery Data Transfer Service Agent
   - Dataflow Admin
   - Pub/Sub Admin
   - Key Json file
   
Note: To get complete data cycle dataflow job configuration must be set seperatly. Code doesn't provide it. 

## Usage 
To clone repo 
`git clone https://github.com/tmuratcamli/datapipeline-nodejs-gcp.git`
To run app 
`npm start`
update .env file with corresponding values. 

### POST REQUEST 
![image](https://github.com/user-attachments/assets/663eec59-9fc2-4c7d-916a-54d90bbe3feb)
- Since this service will be under high traffic, bulk publishing is preferred. 
- Approach: Server keep 3 different arrays to handle logs; logQueue, failedLogs, persistentFailures. 
- Functionality of each middleware in order ;

#### validateSchema
- reqeust.body objects are compiled to compare defined schema in ./models/schema.json.
- the mismatched schemas are not added to logQueue. No bad response here, just console.log()

#### addToQueue
 - matched logs are pushed to logQueue.

#### initialBulkPublish
 - We try bulk publish with first N elements of logQueue. to set size -> .env BATCH_SIZE 
 - failed batches are pushed to failedLogs array.

#### handleFails
 - we try bulk publish with smaller batch sizes. to set ratio -> .env BATCH_SIZE_DIVISION  
 - failed batches are pushed to persistenFailures.

#### handlePersistentFails;
 - we try bulk publish with backoff and retry mechanism.
 - to set -> .env MAX_BATCH_SIZE, BACKOFF_BASE_DELAY, MAX_BACKOFF_DELAY, MAX_RETRY
 - failed logs stay in the array.

### Images From Local Development Environment (post)

- I am not sure these are neccessary but just to provide quick check if they help to review. 

![image](https://github.com/user-attachments/assets/ffd9af8e-769f-4ade-a050-ad1dd8db9b7b) 

![image](https://github.com/user-attachments/assets/67b55c88-57d6-458e-a595-ab6574e52d5a)

![image](https://github.com/user-attachments/assets/ac760c4b-e951-4ed0-a102-61d04e5f3d57)

### GET REQUEST
 - Get request handled by just one function.
 - To get previous days summary in every time is not a good practice.
 - Since they stay same, can be cached but
 - it lead me to deep waters little bit when I tried to implement.

![image](https://github.com/user-attachments/assets/2a683148-21f7-4cef-ab44-2e7137a48aa9)



