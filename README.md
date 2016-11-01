# Cupassist Update Player api!

## Hva er oppgaven til dette systemet?

Dette programmet ligger mellom [Spiller API](https://github.com/osvb/player-api) og [Cupassist Wrapper API](https://github.com/osvb/beach-ranking-api)

Oppgavene til dette programmet er og hente ned det siste dataene fra Cupassist og legge det inn i spiller databasen (via Spiller API).

Steg dette programmet gjøre:
1. Henter ned alle årene vi har ranking data (2007 - nå) via cupassist wrapperen
(for eksempel. https://api.osvb.no/ranking/2007/K (eller M)

2. Så går den igjennom alle spillerne og finner alle som har samme id og gruppere de sammen

3. Den formattere så dateen slik Spiller Api vil ha det og sender dataene inn dit.


## Hva skal til for å hjelpe til her?

### Programmer du må installere

1. Du trenger [Node](nodejs.org), versjon 7 eller seneste er sikkert lurt.
2. Du trenger [Git](https://git-scm.com/downloads).

### Skritt for Skritt veiledning til å kjøre programmet

Vi forutsetter her at du har installert Node og Git.
Dette kan du verifisere ved å gå inn i powershell eller terminalen din og skrive `node` eller `git`.

1. Last ned dette repoet.

`git clone git@github.com:osvb/cupassist-update-player-api.git`

2. gå inn i mappen

`cd cupassist-update-player-api`

3. Installer appen med avhengiheter

`npm install`

4. Kjør programmet

`DEBUG="*,-babel,-follow-redirects" PLAYER_API="http://<brukernavn>:<passord>@localhost:9000/players" ./node_modules/.bin/babel-node index.js`

Programmet vil nå starte og hente data fra cupassist og lagre det til en database via spiller apiet.

*OBS:*
1. Brukernavn og passord må dere spørre om på [slack](osvb.slack.com) da det ikke kan ligge ute tilgjeglig for alle.

2. Evt så kan man sette opp sin eget Spiller API, da bestemmer du passord og brukernavn selv. Les mer på READMEen til [Spiller API](https://github.com/osvb/player-api) for hvordan du gjøre dette.

## TODO's

*Hva gjenstår, hva kan du hjelpe til med?*

1. Cupassist er ikke feilfritt, det er endel duplikater som skulle verdt fjernet.
  - er det samme navn og fødselsår på spilleren, og de ikke har noen år som overlapper så er det nok duplikater.
    dog bør dette gåes igjennom og verifiseres over hele linjen.

2. Ønsker også og ta inn turneringsresultater og makker, men da må det gjøres en jobb i [Cupassist Wrapper API](https://github.com/osvb/beach-ranking-api) først.
