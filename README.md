# Parker Subway Challenge

This challenge models a subway system, inspired by the Parker Challenge found [here](https://app7.greenhouse.io/tests/bb987a48650e0bf41265c903da54c4de?utm_medium=email&utm_source=TakeHomeTest). Ambiguities in the challenge are addressed with logical assumptions, which are documented for clarity.

## Prerequisites
- Docker installed on the system.
- Newman for API testing (`npm install -g newman`).

## Setup and Execution
To start the app, execute:
```
docker-compose build && docker-compose up
```


## API Endpoints and Usage

### Challenge 1: Train Line Management

#### Create a Train Line
- **POST** `/train-line`
  - Creates a new train line with predefined stations.
  - Returns 201 on success or a message if the train line exists.
  - Request body example:
    ```json
    {
      "stations": ["14th", "23rd", "34th", "42nd", "50th", "59th"],
      "name": "A"
    }
    ```
  
#### Retrieve the Shortest Route
- **GET** `/route?origin={origin}&destination={destination}`
  - Finds the shortest path between two stations.
  - Requires valid `origin` and `destination` station parameters.
  - `origin` and `destination` cannot be the same.

### Challenge 2: Fare and Card Management

#### Create a Train Line with Fare
- **POST** `/train-line`
  - Similar to Challenge 1 but allows an additional `fare` attribute.
  - Defaults to $2.75 if `fare` is not provided.
  - Request body example:
    ```json
    {
      "stations": ["Canal", "Oyebola", "14th"],
      "name": "O",
      "fare": 3
    }
    ```

#### Manage a Transit Card
- **POST** `/card`
  - Creates or tops up a transit card.
  - Request body example:
    ```json
    {
      "card_number": "239294",
      "amount": 10
    }
    ```

#### Station Entry and Exit
- **POST** `/station/:station/enter` and `/station/:station/exit`
  - Manages the cardholder's station entry and exit.
  - Charges are applied at the end of the trip based on the shortest path cost(The challenge wasn't very clear but this made the most sense).
  - Request body example for both enter and exit:
    ```json
    {
      "card_number": "239294"
    }
    ```
  - The `:station` parameter in the URL should be replaced with the actual station name for both entry and exit endpoints.
  - Users cannot enter if they owe or have no money.
  - Every enter must have a matching exit at another station.
  - Cards are charged based on the train lines taken in the shortest path between entry and exit station

### Testing with Newman
Run the Postman collection using Newman with the following command:
```
newman run postman.json --verbose
```

## Assumptions and Decisions
- User authentication is handled outside of this system.
- Train lines, once created, are not expected to change frequently.
- Train lines operate bidirectionally.

## Solution Insights
I've always wanted to try out graph databases so I saw this as an opportunity to use Neo4j for managing the subway's graph-based data structure, optimizing search operations for train lines.

## Potential Optimizations
- Precalculate route distances to enable immediate O(1) time responses for frequently accessed endpoints.

## Areas for Improvement
- Implement Jest for comprehensive testing.
- Establish database transaction rollbacks for operational reliability.
- Further modularize the codebase for maintainability, for example, move my routes to a separate file, etc.
