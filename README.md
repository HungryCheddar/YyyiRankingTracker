# YyyiRankingTracker
A ranking cut-off tracker for the mobile game YuYuYui.

## Problem Statement
In the game YuYuYui, there are occasional events under the category of "ranking events".
These events contain stages which the players can farm to earn points. 
The players are then ranked based on the points they have earned and are rewarded at the end of the event based on said ranks.

The ranking cut-off points can be viewed on a web page and are updated at fixed intervals.
However, there is no history shown and hence it is difficult to gauge the rate of change of points.

Hence, the aim of this project is to collect the history of the points for potential analysis and strategical planning.


## Setup
Clone the repository and run `npm install` to install the dependencies in the local folder.


## Components
### Data Retriever
This component encapsulates the mechanisms used to access the page and convert the ranking points data into the record table.

### Host
This component stores the existing records and serves HTTP get requests

Current requests that it serves are:
 - `/records` Returns the entire record table in a json object.
   ```
   {
     "table" : [ [{"points":number, "time":string},...],... ] 
   }
   ```
 
#### Missing features
- Backup existing records after retrieving updated data.
- Load from backup of existing records on start up

#### Potential features:
- Host on the cloud (maybe Heroku?)

### Client
This is currently a simple test client to show that records can be fetched.

#### Potential Features
- An App with Flutter/React/etc that will be able to retrieve the data and allow the user to:
  - Display in multiple different ways.
  - Set point alarms to notify the user when a certain point threshold has been crossed
  

## Demo
1. Open a terminal in the repository root and CD into `./DummyServer`
2. Run `npx http-server` to host that folder on localhost:8080
3. Open another terminal in the repository root and CD into `./src`
4. Run `node ./host.js` to host the Host server that will server the records
5. Open another terminal in the repository root and CD into `./src`
6. Run `node ./Client.js` to run a Client that will get the records and print the elements of the table
    1. Alternatively, visit `http://localhost:3000/records` to view the raw json served by Host.js
