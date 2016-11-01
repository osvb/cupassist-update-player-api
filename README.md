# Cupassist Update Player api!

## Hva er oppgaven til dette systemet?

Dette programmet ligger mellom [Player API] og [Cupassist Wrapper API](https://github.com/osvb/beach-ranking-api)

Oppgavene til dette programmet er og hente ned det siste dataene fra Cupassist og legge det inn i spiller databasen (via Player API).

Steg dette programmet gjøre:
1. Henter ned alle årene vi har ranking data (2007 - nå) via cupassist wrapperen
(for eksempel. https://api.osvb.no/ranking/2007/K (eller M)

2. Så går den igjennom alle spillerne og finner alle som har samme id og gruppere de sammen

3. Den formattere så dateen slik Player API vil ha det og sender dataene inn dit.


## Hva skal til for å hjelpe til her?

### Programmer du må installere

1. Du trenger [Node](nodejs.org), versjon 7 eller seneste er sikkert lurt.
2. Du trenger [Git](https://git-scm.com/downloads).

### Skritt for Skritt veiledning til å kjøre programmet

Vi forutsetter her at du har installert Node og git.
Dette kan du verifisere ved å gå inn i powershell eller terminalen din og skrive `node` eller `git`.

1. Last ned dette repoet.
`git clone 


## TODO's

Hva gjenstår, hva kan du hjelpe til med?

1. Cupassist er ikke feilfritt, det er endel duplikater som skulle verdt fjernet.
  - er det samme navn og fødselsår på spilleren, og de ikke har noen år som overlapper så er det nok duplikater.
    dog bør dette gåes igjennom og verifiseres over hele linjen.

2. Ønsker også og ta inn turneringsresultater og makker, men da må det gjøres en jobb i [Cupassist Wrapper API](https://github.com/osvb/beach-ranking-api) først.
