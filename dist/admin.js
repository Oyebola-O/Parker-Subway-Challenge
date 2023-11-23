"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const postgres_1 = require("./postgres");
const index_1 = require("./index");
class Admin {
    constructor() { }
    createOrUpdateCard(card_number, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let card = yield postgres_1.Card.findOne({ where: { card_number } });
                if (!card) {
                    card = new postgres_1.Card();
                    card.card_number = card_number;
                }
                card.balance = Number(card.balance) + amount;
                yield card.save();
                return [true, { message: `Card transaction successful, new balance for ${card.card_number} is ${card.balance}` }];
            }
            catch (error) {
                return [false, { message: `Error creating card` }];
            }
        });
    }
    beginTrip(card_number, station) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let card = yield postgres_1.Card.findOne({ where: { card_number } });
                let origin = yield postgres_1.Station.findOne({ where: { name: station } });
                let staleTrip = yield postgres_1.Trip.findOne({
                    where: { card: { card_number: card_number } },
                    relations: ["origin", "destination"],
                    order: { startedAt: 'DESC' }
                });
                if (!card)
                    return [false, { message: "Error, card doesn't exist" }];
                if (!origin)
                    return [false, { message: "Error, station doesn't exist" }];
                if (card.balance <= 0)
                    return [false, { message: "Error, you don't have enough funds" }];
                if (staleTrip && staleTrip.destination == null)
                    return [false, { message: `It looks like ${card.card_number} still has an open trip from ${staleTrip.origin.name}, close it first` }];
                let newTrip = yield postgres_1.Trip.create();
                newTrip.card = card;
                newTrip.origin = origin;
                yield newTrip.save();
                return [false, { message: `Successfull started trip from ${newTrip.origin.name} for ${card.card_number}, current balance ${card.balance}` }];
            }
            catch (error) {
                console.log(error);
                return [false, { message: "Failed to begin trip" }];
            }
        });
    }
    endTrip(card_number, station) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let card = yield postgres_1.Card.findOne({ where: { card_number } });
                let destination = yield postgres_1.Station.findOne({ where: { name: station } });
                if (!card)
                    return [false, { message: "Error, card doesn't exist" }];
                if (!destination)
                    return [false, { message: "Error, station doesn't exist" }];
                let trip = yield postgres_1.Trip.findOne({
                    where: { card: { card_number: card.card_number } },
                    relations: ["origin", "destination"],
                    order: { startedAt: 'DESC' }
                });
                if (!trip || trip.destination != null)
                    return [false, { message: "There are no open trips to close" }];
                if (trip.origin.name == destination.name)
                    return [false, { message: "Error, you can't have the same start and end destination" }];
                let [success, final_fare] = yield index_1.subway.getFare(trip.origin.name, destination.name);
                if (!success)
                    return [false, { message: "Error, databse issue, couldn't calculcate final fare" }];
                card.balance -= final_fare;
                trip.destination = destination;
                trip.final_fare = final_fare;
                yield card.save();
                yield trip.save();
                return [true, { message: `Successfully ended trip that started at ${trip.origin.name} and ended at ${trip.destination.name} for ${card.card_number}, final cost is $${trip.final_fare} new balance $${card.balance}` }];
            }
            catch (error) {
                console.log(error);
                return [false, { message: `Couldn't end trip` }];
            }
        });
    }
}
exports.Admin = Admin;
//# sourceMappingURL=admin.js.map