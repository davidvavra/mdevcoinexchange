import * as admin from 'firebase-admin';
import * as transactions from './transactions'
import { ORGS_UID, ALL_COINS_COUNT, PARTNER_CURRENCIES, PARTNER_LEVELS, PARTNERS_COIN_AMOUNT, ATTENDEE_INITIAL_COIN_AMOUNT } from './constants';
import { Balances } from './users';

export async function process() {
    let init = (await admin.database().ref("init").once("value")).val()
    if (init == true) {
        console.log("Initializing ...")
        console.log("ALL_COINS_COUNT = "+ALL_COINS_COUNT)
        console.log("ATTENDEE_INITIAL_COIN_AMOUNT = "+ATTENDEE_INITIAL_COIN_AMOUNT)
        console.log("PARTNERS_COIN_AMOUNT = "+PARTNERS_COIN_AMOUNT)
        await admin.database().ref("init").remove()
        // Create initial balance
        let oneInitialBalance = Math.round(ALL_COINS_COUNT / 3)
        console.log("ORGS initial balance = "+oneInitialBalance)
        await admin.database().ref("balances/" + ORGS_UID).set(new Balances(oneInitialBalance, oneInitialBalance, oneInitialBalance))
        // Send initial coins to partners
        let levelSum = 0
        Object.keys(PARTNER_LEVELS).forEach(uid => {
            levelSum += PARTNER_LEVELS[uid]
        });
        Object.keys(PARTNER_LEVELS).forEach(async uid => {
            await admin.database().ref("balances/" + uid).set(new Balances(0, 0, 0))
            let amount = Math.round(PARTNERS_COIN_AMOUNT / levelSum * PARTNER_LEVELS[uid])
            let currency = PARTNER_CURRENCIES[uid]
            console.log("Sending "+amount+" "+currency+" to "+uid);
            await transactions.create(new transactions.Transaction(ORGS_UID, amount, currency, uid, 0, currency, admin.database.ServerValue.TIMESTAMP))
        });
    }
}