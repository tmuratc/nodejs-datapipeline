# Description
This is a Node.js express app as a data pipeline backend web service. It will designed to response following;
 - Post Request will paste json event logs to BigQuery table.
 - Get Request will return a summary result from BigQuery table.
 - Service is designed to have data life cycle as;
   - post request ---> pub/sub ---> dataflow job ---> BigQueryTable ---> get request 
