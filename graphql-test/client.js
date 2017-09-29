const Lokka = require("lokka").Lokka;
const Transport = require("lokka-transport-http").Transport;

const headers = {
  Authorization: process.env.TOKEN // 'Bearer YOUR_AUTH_TOKEN'
};

const client = new Lokka({
  transport: new Transport(process.env.GRAPHQL_SERVER, { headers })
});

export function mutate(string) {
  console.log("mutating query", string);
  client
    .mutate(string)
    .then(data => console.log("mutating", data))
    .catch(err => console.log("err", err));
}

export function query(query, ...args) {
  return client.query(query, ...args);
}
