import * as admin from 'firebase-admin';
import * as users from './users'
import { ORGS_UID, ATTENDEE_INITIAL_COIN_AMOUNT, SPECIAL_UIDS } from './constants';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
import * as rates from './rates'
import * as offers from './offers'

export async function createInitial(currency: string, uid: string) {
    await create(new Transaction(ORGS_UID, ATTENDEE_INITIAL_COIN_AMOUNT, currency, uid, 0, currency, admin.database.ServerValue.TIMESTAMP))
}

export async function create(transaction: Transaction) {
    await admin.database().ref("transactions").push(transaction)
}

export async function process(snap: DataSnapshot) {
    let transaction = snap.val() as Transaction
    let sellerBalance = await users.getBalance(transaction.sellerId, transaction.currencyOffered)
    if (sellerBalance < transaction.amountOffered) {
        // Seller doesn't have enough balance
        await deleteTransaction(snap.key)
        return
    }
    if (transaction.amountOffered != 0) {
        let buyerBalance = await users.getBalance(transaction.buyerId, transaction.currencyRequired)
        if (buyerBalance < transaction.amountRequired) {
            // Buyer doesn't have enought balance
            await deleteTransaction(snap.key)
            return
        }
    }
    // Everything OK
    // Update balances
    await users.decreaseBalance(transaction.sellerId, transaction.amountOffered, transaction.currencyOffered)
    await users.increaseBalance(transaction.buyerId, transaction.amountOffered, transaction.currencyOffered)
    if (transaction.amountRequired != 0) {
        await users.increaseBalance(transaction.sellerId, transaction.amountRequired, transaction.currencyRequired)
        await users.decreaseBalance(transaction.buyerId, transaction.amountRequired, transaction.currencyRequired)
        // Update oneCoinInCzk
        await rates.saveOneCoinInCzk(transaction)
    }
    // Check invalid offers
    await offers.checkAllOffersForValidity()
    // Update coinsOwnedByAttendees
    // We assume that amountRequired is always 0 for attendee-nonattendee transactions
    if (isAttendee(transaction.buyerId) && !isAttendee(transaction.sellerId)) {
        await increaseCoinsOwnedByAttendees(transaction.amountOffered, transaction.currencyOffered)
    }
    if (!isAttendee(transaction.buyerId) && isAttendee(transaction.sellerId)) {
        await decreaseCoinsOwnedByAttendees(transaction.amountOffered, transaction.currencyOffered)
    }
}

function isAttendee(uid: string): boolean {
    return SPECIAL_UIDS.indexOf(uid) == -1
}

async function increaseCoinsOwnedByAttendees(amount: number, currency: String) {
    await admin.database().ref("coinsOwnedByAttendees/" + "/" + currency).transaction(current => {
        return (current || 0) + amount
    })
}

async function decreaseCoinsOwnedByAttendees(amount: number, currency: String) {
    await admin.database().ref("coinsOwnedByAttendees/" + "/" + currency).transaction(current => {
        return (current || 0) - amount
    })
}

async function deleteTransaction(id: string) {
    await admin.database().ref("transactions/" + id).remove()
}

export class Transaction {
    constructor(
        public sellerId: string,
        public amountOffered: number,
        public currencyOffered: string,
        public buyerId: string,
        public amountRequired: number,
        public currencyRequired: string,
        public timestamp: number
    ) { }
}