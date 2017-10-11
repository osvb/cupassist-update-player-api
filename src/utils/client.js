import LokkaExport from "lokka"
import lokkaTransportHttp from "lokka-transport-http"

const Lokka = LokkaExport.Lokka
const Transport = lokkaTransportHttp.Transport

const headers = {
  Authorization: process.env.TOKEN // 'Bearer YOUR_AUTH_TOKEN'
};
console.log("process.env.GRAPHQL_SERVER", process.env.GRAPHQL_SERVER);
const client = new Lokka({
  transport: new Transport(process.env.GRAPHQL_SERVER, { headers })
});

export function mutate(string) {
  return client.mutate(string);
}

export function query(query, ...args) {
  return client.query(query, ...args);
}

export function mutateWithLog(string) {
  mutate(string)
    .then(data => console.log("mutating", data))
    .catch(err => console.log("err", err));
}
