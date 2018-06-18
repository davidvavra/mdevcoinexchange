# mDevCoinExchange
Conference gamification inspired by cryptocurrency market

[Learn more details from the blogpost](https://medium.com/mdevcamp/mdevcoinexchange-a-successful-conference-gamification-based-on-firebase-and-angular-fc7efee53da0)

## Try it
- [UI for attendees and partners](http://ex.mdevcamp.eu)
- [UI for TV](http://ex.mdevcamp.eu/tv) (you need to be logged in as any user)
- [UI for cash outs](http://ex.mdevcamp.eu/cash-outs) (you need to be logged in as CASH user)
- [UI for available prizes](https://docs.google.com/spreadsheets/d/17lB_dQh59POsdNgU_Y2qt6Xq6IIfh6ag8Q2hPJMWEHA/edit?usp=sharing)

(find private keys for login in `clean-database.json`)

## Technologies
- Firebase Realtime Database
    - see `sample-database.json` and `database.rules.bolt`
- Firebase Functions in TypeScript
    - see `functions` folder
- Angular 5
    - see `web` folder

## Setup

### Prerequisities
- Node.js
- Firebase CLI
- Firebase Bolt
- Angular CLI
- Typescript

### Firebase part
- Create a new Firebase project
- `firebase init` and assign the project there
- Generate a service account for functions and add the keys to `functions/src/service_account.ts`
- `cd functions`
- `npm install`
- Change Firebase URL in `src/index.ts`
- Deploy functions (next part)
- Upload `clean-database.json` through Firebase console

### Web part
- `cd web`
- `npm install`
- Change Firebase configuration in `web/src/environments`

## Deploy
- `cd web`
- `ng build --env=prod` (or `ng serve` for local development)
- `cd ..`
- `firebase deploy`

## Credits and license
The code is available under MIT license. Please let us know if you use it, we are curious!

This game was developed by David Vávra (frontend, leadership), Jiří Čadek (backend, testing) and David Ryšánek (graphs, design, TV).
