# Node.js Express API for Publishing Logs to Pub/Sub and Querying BQ
![Architecture Diagram](./architecture-diagram.png)

## Description
This is a Node.js express app as a data pipeline backend web service. It will designed to response following;
 - Post Request will paste json logs to BigQuery table.
 - Get Request will return a summary result from BigQuery table.
 - Service is designed to have data life cycle as;
   - Post Request-> Pub/Sub -> BigQuery Table -> Get Request

However there is no setup configuration for GCP services in the repository. Therefore following prerequisites must be created in GCP.

## Prerequisites
 - BigQuery Table
 - Pub/Sub Topic
 - Key Json file for service account that has following roles;
   - BigQuery Data Editor
   - BigQuery Data Transfer Service Agent
   - Pub/Sub Admin
 
   
Note: To get complete data life cycle data proccessing operation (from Pub/Sub to BQ) must be set. Code doesn't provide it. 

## Installation - Local Windows Environment
To start this application in your local environment run following commands;

### 1. Start Docker Desktop application. 
If you don't have click [here](https://docs.docker.com/desktop/install/windows-install/) to install.

### 2. Clone this repo.  
```bash
git clone https://github.com/tmuratcamli/datapipeline-nodejs-gcp.git
````

### 3. Update .env file with corresponding values. 
```bash
GCP_PROJECT_ID = "gcp-project-id"
GCP_CREDENTIALS_KEY_PATH = "path-to-credential.json-of-service-account"
TOPIC_NAME = "pubsub-topic-name"
BQ_TABLE = "BigQuery-Table"
BQ_DATASET = "BigQuery-Dataset" 
BATCH_SIZE = 1000 
MAX_BATCH_SIZE = 1000
BATCH_DIVISION = 4
BACKOFF_BASE_DELAY_MS =  1000
MAX_BACKOFF_DELAY_MS = 60000
MAX_RETRY = 3

PORT = 3000
````

### 4. Build the Docker image
```bash
docker build -t your-app-name  . 
````

### 5. Run the Docker container
```bash
docker run -p 3000:3000 your-app-name
````


### POST REQUEST 
- Service is designed to handle high traffic without single loss of logs. 
- Approach: Server keeps 3 different arrays to handle logs; logQueue, failedLogs, persistentFailures. 
- Functionality of each middleware in order ;

#### validateSchema
- Reqeust.body objects are compiled to compare defined schema in ./models/schema.json.
- Object's schema atrribute is set. 

#### addToQueue
 - Matched logs are pushed to logQueue.

#### initialBulkPublish
 - Publishing bulk with first N elements of logQueue. 
 - To set size -> .env BATCH_SIZE 
 - Failed batches are pushed to failedLogs array.

#### handleFails
 - PublishİNG bulk with smaller batch sizes. 
 - To set ratio -> .env BATCH_SIZE_DIVISION  
 - Failed batches are pushed to persistenFailures.

#### handlePersistentFails;
 - Publishing bulk with backoff and retry mechanism.
 - To set -> .env MAX_BATCH_SIZE, BACKOFF_BASE_DELAY, MAX_BACKOFF_DELAY, MAX_RETRY
 - Failed logs stay in the array.


## GET REQUEST
- Running the defined queries in ./scripts/getQueries as BigQuery client.

## NOTES
- As it is said before this project doesn't provide data proccesing for from Pub/Sub to BQ operation. 
- For Pub/Sub to BQ process; DataFlow, Cloud Functions, Cloud Run services can be considered.
- This project can be adapted to different use cases by modifying ./models/scjema.json and scripts/getQueries.js files.
