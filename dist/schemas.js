"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripSchema = exports.cardSchema = exports.trainLineSchema = exports.routeSchema = void 0;
;
;
;
;
;
const routeSchema = {
    schema: {
        querystring: {
            type: 'object',
            required: ['origin', 'destination'],
            properties: {
                origin: { type: 'string' },
                destination: { type: 'string' }
            }
        }
    }
};
exports.routeSchema = routeSchema;
const trainLineSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['stations', 'name'],
            properties: {
                stations: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 2
                },
                name: { type: 'string' },
                fare: {
                    type: 'number',
                    minimum: 0
                }
            }
        }
    }
};
exports.trainLineSchema = trainLineSchema;
const cardSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['card_number', 'amount'],
            properties: {
                card_number: { type: 'string' },
                amount: {
                    type: 'number',
                    minimum: 0
                }
            }
        }
    }
};
exports.cardSchema = cardSchema;
const tripSchema = {
    schema: {
        params: {
            type: 'object',
            properties: {
                station: { type: 'string' },
            },
            required: ['station']
        },
        body: {
            type: 'object',
            properties: {
                card_number: { type: 'string' },
            },
            required: ['card_number']
        }
    }
};
exports.tripSchema = tripSchema;
//# sourceMappingURL=schemas.js.map