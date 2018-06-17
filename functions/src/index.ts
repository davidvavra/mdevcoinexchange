import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as users from './users';
import { serviceAccount } from './service_account'
import * as transactions from './transactions'
import * as rates from './rates'
import * as offers from './offers'
import * as transfers from './transfers'
import * as cashOuts from './cash_outs'
import * as initialization from './init'

admin.initializeApp({
      databaseURL: "https://TODO.firebaseio.com",
      credential: admin.credential.cert(serviceAccount)
    });

export let login = functions.https.onRequest(async (request, response) => {
    await users.login(request.query["privateKey"], request.query["password"], response)
})

export let processTransaction = functions.database.ref("transactions/{id}").onCreate(async (snapshot, context) => {
    await transactions.process(snapshot)
})

export let calculateAverageRate = functions.database.ref("oneCoinInCzk/{id}").onCreate(async (snapshot, context) => {
    await rates.calculateAverage(snapshot)
})

export let processOffer = functions.database.ref("offers/{id}").onCreate(async (snapshot, context) => {
    await offers.process(snapshot)
})

export let buyOffer = functions.database.ref("offers/{id}").onUpdate(async (snapshot, context) => {
    await offers.buy(snapshot.after)
})

export let processTransfer = functions.database.ref("transfers/{id}").onCreate(async (snapshot, context) => {
    await transfers.process(snapshot)
})

export let processCashOut = functions.database.ref("cashOuts/{id}").onCreate(async (snapshot, context) => {
    await cashOuts.process(snapshot)
})

export let init = functions.database.ref("init").onCreate(async (snapshot, context) => {
    await initialization.process()
})