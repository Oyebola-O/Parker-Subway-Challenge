interface RouteQuery {
  origin: string;
  destination: string;
};

interface TrainLineBody {
  stations: string[];
  name: string;
  fare?: number;
};

interface CardBody {
  card_number : string,
  amount : number
};

interface TripParams {
  station: string;
};

interface TripBody {
  card_number: string;
};



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

export { RouteQuery, TrainLineBody, CardBody, TripParams, TripBody };
export { routeSchema, trainLineSchema, cardSchema, tripSchema };