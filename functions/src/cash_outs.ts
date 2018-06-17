import { DataSnapshot } from "firebase-functions/lib/providers/database";
import * as users from './users'
import * as admin from 'firebase-admin';
import * as transactions from './transactions'
import * as rates from './rates'
import { CASH_OUT_UID } from "./constants";

export async function process(snap: DataSnapshot) {
    let cashOut = snap.val() as CashOut
    let balances = await users.getBalances(cashOut.userId)
    if (balances == null) {
        // User doesn't have balances
        await deleteCashOut(snap.key)
        return
    }
    let latestRates = await rates.getLatest()
    let totalBalancesInCzk = balances.ADC * latestRates.ADC + balances.IDC * latestRates.IDC + balances.XPC * latestRates.XPC
    if (totalBalancesInCzk < cashOut.amountInCzk) {
        // User doesn't have enough balance
        await deleteCashOut(snap.key)
        return;
    }
    // Everything OK
    await admin.database().ref("cashOuts/" + snap.key + "/validated").set(true)
    var ratio = cashOut.amountInCzk / totalBalancesInCzk
    if (balances.ADC > 0) {
        await transactions.create(new transactions.Transaction(cashOut.userId, balances.ADC * ratio, "ADC", CASH_OUT_UID, 0, "ADC", admin.database.ServerValue.TIMESTAMP))
    }
    if (balances.IDC > 0) {
        await transactions.create(new transactions.Transaction(cashOut.userId, balances.IDC * ratio, "IDC", CASH_OUT_UID, 0, "IDC", admin.database.ServerValue.TIMESTAMP))
    }
    if (balances.XPC > 0) {
        await transactions.create(new transactions.Transaction(cashOut.userId, balances.XPC * ratio, "XPC", CASH_OUT_UID, 0, "XPC", admin.database.ServerValue.TIMESTAMP))
    }
}

async function deleteCashOut(id: string) {
    await admin.database().ref("cashOuts/" + id).remove()
}

class CashOut {
    public amountInCzk: number
    public userId: string
}