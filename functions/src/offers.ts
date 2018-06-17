import * as admin from 'firebase-admin';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
import * as users from './users'
import * as rates from './rates'
import * as transactions from './transactions';

export async function process(snap: DataSnapshot) {
    let offer = snap.val() as Offer
    let balance = await users.getBalance(offer.sellerId, offer.currencyOffered)
    if (balance < offer.amountOffered) {
        // Seller doesn't have enough balance
        await deleteOffer(snap.key)
        return
    }
    // Everything OK
    let oneOfferedCoinInCzk = rates.getOneOfferedCoinInCzk(offer.amountOffered, offer.amountRequired)
    await admin.database().ref("offers/" + snap.key + "/oneOfferedCoinInCzk").set(oneOfferedCoinInCzk)
}

export async function buy(snap: DataSnapshot) {
    let offer = snap.val() as Offer
    if (offer.buyerId != null) {
        if (offer.buyerId == offer.sellerId) {
            // Buying it's own offer
            await deleteBuyerId(snap.key)
            return
        }
        let sellerBalance = await users.getBalance(offer.sellerId, offer.currencyOffered)
        if (sellerBalance < offer.amountOffered) {
            // Seller doesn't have enough balance
            await deleteOffer(snap.key)
            return
        }
        let buyerBalance = await users.getBalance(offer.buyerId, offer.currencyRequired)
        if (buyerBalance < offer.amountRequired) {
            // Buyer doesn't have enough balances
            await deleteBuyerId(snap.key)
            return;
        }
        // Everything OK
        await deleteOffer(snap.key)
        await transactions.create(new transactions.Transaction(offer.sellerId, offer.amountOffered, offer.currencyOffered, offer.buyerId, offer.amountRequired, offer.currencyRequired, admin.database.ServerValue.TIMESTAMP))
    }
}

export async function checkAllOffersForValidity() {
    (await admin.database().ref("offers").once("value")).forEach(async snap => {
        let offer = snap.val() as Offer
        let sellerBalance = await users.getBalance(offer.sellerId, offer.currencyOffered)
        if (sellerBalance < offer.amountOffered) {
            deleteOffer(snap.key)
        }
    });
}

async function deleteBuyerId(id: string) {
    await admin.database().ref("offers/" + id + "/buyerId").remove()
}

async function deleteOffer(id: string) {
    await admin.database().ref("offers/" + id).remove()
}

class Offer {
    public amountOffered: number
    public amountRequired: number
    public currencyOffered: string
    public currencyRequired: string
    public sellerId: string
    public buyerId: string
}