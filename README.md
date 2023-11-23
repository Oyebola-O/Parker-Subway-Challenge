
# Parker Subway Challenge
This challenge is supposed to model the Subway based on the parker challenge [here](https://app7.greenhouse.io/tests/bb987a48650e0bf41265c903da54c4de?utm_medium=email&utm_source=TakeHomeTest). I tried to fit the description as much as I could and in cases where the challenge was ambigous, I did what made the most sense and documented my assumptions.

## Running, Testing and Major Endpoints

## Challenge 1

POST /train-line

POST http://localhost:3000/train-line
{
  "stations": ["14th", "23rd", "34th", "42nd", "50th", "59th"],
  "name": "A"
}

    This endpoint creates a train line and sends a 201 acknowledging creation.
    If the trainline is already in the database, it sends a response saying so.
    Trainlines can only be created once.




GET /http://localhost:3000/route?origin={origin}&destination={destination}

    This ednpoint returns the shortest path between two stations, the trains needed to take at each station to travel the journey and the cost which is calculated by the unique train lines taken.
    Both origin & destination must be valid stations
    The origin cannot equal the destination 

## Challenge 2

POST http://localhost:3000/train-line
{
  "stations": ["Canal", "Oyebola", "14th"],
  "name": "O",
  "fare": 3
}

    This endpoint is similar to the first. Only difference is you can add a fare. 
    If no fare is added, a default fo $2.75 will be added



POST http://localhost:3000/card
{
  "card_number": "239294",
  "amount": 10
}


    This endpoint creates a new card. If there is already one with the same card number, it tops it off with more money



POST http://localhost:3000/station/:station/enter
{
    "card_number" : "239294"
}


POST http://localhost:3000/station/:station/exit
{
    "card_number" : "239294"
}

    These two are sister endpoints. They both take in a station to either enter or exit. 
    The challenge wasn't clear about how to charge the card so the way it works is this:
        - The card doesn't get charged until the end of the trip
        - At the start of the trip, we make sure there is some money in the card. 
        - If the user takes more trains than they have the balance to pay for, their balance becomes negative.
        - For every starting trip, there must be a corresponding ending trip. If this is not fulfiled, the server will request for you to end the trip before you can start a new one
        - The way trips are charged is based on the cost of the shortest path between your start and end destination

### Testing
In order to test, I've included a collection in `postman.json`. You can run it using 

newman run postman.json --verbose

Feel free to play with the API and change the request as you feel. As long as you stick with the rules in the readme, it should not break. The worst case is you'll hit an error that I've most likely caught.

### Here are some assumptions I've made

1. Authentication is implemented elsewhere in the system
2. Only admins can add train lines and new train lines are not added often
3. You can only add a train line once(Maybe delete/update is an endpoint to implement in the future)
4. Train lines move both ways meaning, if I can take Train line 1 to ["Canal", "Houston", "Christopher", "14th"], I can also take it in reverse: ["14th", "Christopher", "Houston", "Canal"]


### As for my solution:
I initally implemented the search but I've been wanting to learn more about graph databases so I decided to use neo4j to handle the train lines. It basically does this for me




### Optimizations I could make:
1. My BFS is searching based on stations, it could search based on train lines, e.g we look at the train lines from out origin & those from our destination and trace where they intersect but this could get complicated.

2. I could precalculater all distances in my BFS, that way the server just returns a value instantly in O(1) time. This would make a lot of sense since this would probably be the most hit endpoint and train lines don't change often. Obviously we'd have to recalculate if a train went down or something similar.

### Improvements I could make
1. Write Jest Tests. I was going to write tests but I was starting to spend too much time on the challenge so I included a postman collection in the repo

2. Some of my endpoints don't implement rollbacks in the case of failiure while interacting with the database. Meaning if execution fails, although unlikely, there is no rollback.

3. I could've broken down the code a bit more, for example my routes are in the main file. I just didn't want to have too many files

4. It would be much better to make some of these decisions if I knew what I was optimizing for. For this challenge, I went for code readablity, low execution time for endpoints, resonable error handling and 