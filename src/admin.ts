import { Card, Station, Trip } from "./postgres";
import { Subway } from "./subway";

class Admin {
  private subway: Subway;

  constructor(subway: Subway){
    this.subway = subway;
  }

  /* Public */
  async createOrUpdateCard(card_number : string, amount : number) : Promise<[boolean, { message : string }]> {
    try {
      let card = await Card.findOne({ where: { card_number } });
    
      if(!card){
        card = new Card();
        card.card_number = card_number;
      }

      card.balance = Number(card.balance) + amount;

      await card.save();
      return [true, { message: `Card transaction successful, new balance for ${card.card_number} is ${card.balance}` }];
    } catch (error) {
      return [false, { message: `Error creating card` }];
    }
  }

  async beginTrip(card_number : string, station : string) : Promise<[boolean, { message : string}]> {
    try {
      let card = await Card.findOne({ where: { card_number } });
      let origin = await Station.findOne({ where: { name: station }});
      let staleTrip = await Trip.findOne({
        where: { card: { card_number: card_number } },
        relations: ["origin", "destination"],
        order: { startedAt: 'DESC' }
      });
      

      if(!card) return [false, { message : "Error, card doesn't exist" }];
      if(!origin) return [false, { message : "Error, station doesn't exist" }];
      if(card.balance <= 0) return [false, { message : "Error, you don't have enough funds" }];
      if(staleTrip && staleTrip.destination == null) return [false, { message : `It looks like ${card.card_number} still has an open trip from ${staleTrip.origin.name}, close it first` }];
      

      let newTrip = await Trip.create();
      newTrip.card = card;
      newTrip.origin = origin;
      await newTrip.save();

      return [true, { message: `Successfull started trip from ${newTrip.origin.name} for ${card.card_number}, current balance ${card.balance}` }];
    } catch (error) {
      console.log(error);
      return [false, { message: "Failed to begin trip" }];
    }
  }

  async endTrip(card_number : string, station : string) : Promise<[boolean, { message : string}]> {
    try {
      let card = await Card.findOne({ where: { card_number } });
      let destination = await Station.findOne({ where: { name: station }});
  
      if(!card) return [false, { message : "Error, card doesn't exist"}];
      if(!destination) return [false, { message : "Error, station doesn't exist"}];
  
      let trip = await Trip.findOne({
        where: { card: { card_number: card.card_number } },
        relations: ["origin", "destination"],
        order: { startedAt: 'DESC' }
      });
  
      if(!trip || trip.destination != null) return [false, { message : "There are no open trips to close"}];
      if(trip.origin.name == destination.name) return [false, { message : "Error, you can't have the same start and end destination" }];
  
      let [success, final_fare] = await this.subway.getFare(trip.origin.name, destination.name);
      if(!success) return [false, { message : "Error, databse issue, couldn't calculcate final fare" }];
      
      card.balance -= final_fare;
      trip.destination = destination;
      trip.final_fare = final_fare;
  
      await card.save();
      await trip.save();
  
      return [true, { message: `Successfully ended trip that started at ${trip.origin.name} and ended at ${trip.destination.name} for ${card.card_number}, final cost is $${trip.final_fare} new balance $${card.balance}` }];  
    } catch (error) {
      console.log(error);
      return [false, { message: `Couldn't end trip` }];
    }
  }
}

export { Admin };