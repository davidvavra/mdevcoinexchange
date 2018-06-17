import * as admin from 'firebase-admin';
import { Transaction } from './transactions'
import { ALL_COINS_CZK_VALUE, ALL_COINS_COUNT } from './constants';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';

export async function saveOneCoinInCzk(transaction: Transaction) {
    let oneCoinInCzk: OneCoinInCzk = {}
    oneCoinInCzk[transaction.currencyOffered] = getOneOfferedCoinInCzk(transaction.amountOffered, transaction.amountRequired)
    oneCoinInCzk[transaction.currencyRequired] = getOneRequiredCoinInCzk(transaction.amountOffered, transaction.amountRequired)
    oneCoinInCzk["weight" + transaction.currencyOffered] = transaction.amountOffered
    oneCoinInCzk["weight" + transaction.currencyRequired] = transaction.amountRequired
    oneCoinInCzk["timestamp"] = admin.database.ServerValue.TIMESTAMP
    await admin.database().ref("oneCoinInCzk").push(oneCoinInCzk)
}

export async function calculateAverage(snap: DataSnapshot) {
    let onceCoinInCzk = snap.val() as FullOneCoinInCzk
    let currentTimestamp = onceCoinInCzk.timestamp
    let timestampBefore30Mins = currentTimestamp - 30 * 60 * 1000;
    let adcWeightedSum = 0
    let idcWeightedSum = 0
    let xpcWeightedSum = 0
    let adcSumOfWeights = 0
    let idcSumOfWeights = 0
    let xpcSumOfWeights = 0;
    (await admin.database().ref("oneCoinInCzk").orderByChild("timestamp").startAt(timestampBefore30Mins).once("value")).forEach(snap => {
        let item = snap.val() as FullOneCoinInCzk
        if (item.ADC != null) {
            adcWeightedSum += item.ADC * item.weightADC
            adcSumOfWeights += item.weightADC
        }
        if (item.IDC != null) {
            idcWeightedSum += item.IDC * item.weightIDC
            idcSumOfWeights += item.weightIDC
        }
        if (item.XPC != null) {
            xpcWeightedSum += item.XPC * item.weightXPC
            xpcSumOfWeights += item.weightXPC
        }
    });
    let adcRate = adcSumOfWeights == 0 ? 1 : adcWeightedSum / adcSumOfWeights
    let idcRate = idcSumOfWeights == 0 ? 1 : idcWeightedSum / idcSumOfWeights
    let xpcRate = xpcSumOfWeights == 0 ? 1 : xpcWeightedSum / xpcSumOfWeights
    let rates = new Rates(adcRate, idcRate, xpcRate)
    await admin.database().ref("averageRatesInCzk/"+currentTimestamp).set(rates)
    await admin.database().ref("averageRatesInCzk/latest").set(rates)
}

export function getOneOfferedCoinInCzk(amountOffered: number, amountRequired: number): number {
    let oneCoinInCzk = ALL_COINS_CZK_VALUE / ALL_COINS_COUNT;
    let twoCoinsAmount = amountOffered + amountRequired
    return ((oneCoinInCzk / twoCoinsAmount) * amountRequired) * 2;
}

export async function getLatest(): Promise<Rates> {
    return (await admin.database().ref("averageRatesInCzk/latest").once("value")).val()
}

function getOneRequiredCoinInCzk(amountOffered: number, amountRequired: number): number {
    let oneCoinInCzk = ALL_COINS_CZK_VALUE / ALL_COINS_COUNT;
    let twoCoinsAmount = amountOffered + amountRequired
    return ((oneCoinInCzk / twoCoinsAmount) * amountOffered) * 2;
}

interface OneCoinInCzk {
    [key: string]: any
}

class FullOneCoinInCzk {
    public ADC = 0
    public IDC = 0
    public XPC = 0
    public timestamp: number
    public weightADC = 0
    public weightIDC = 0
    public weightXPC = 0
}

class Rates {
    constructor(public ADC: number, public IDC: number, public XPC: number) { }
}