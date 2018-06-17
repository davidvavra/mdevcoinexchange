import { DataSnapshot } from "firebase-functions/lib/providers/database";
import * as users from './users'
import * as admin from 'firebase-admin';
import * as transactions from './transactions'

export async function process(snap: DataSnapshot) {
    let transfer = snap.val() as Transfer
    transfer.toUser = transfer.toUser.toLowerCase() // This makes sending coins case-insensitive and also disables making transfers to special users
    let toBalance = await users.getBalance(transfer.toUser, transfer.currency)
    if (toBalance == null) {
        // Recipient doesn't exist
        await deleteTransfer(snap.key)
        return;
    }
    let fromBalance = await users.getBalance(transfer.fromUser, transfer.currency)
    if (fromBalance < transfer.amount) {
        // Not enough balance
        await deleteTransfer(snap.key)
        return
    }
    // Everything OK
    await admin.database().ref("transfers/" + snap.key + "/validated").set(true)
    await transactions.create(new transactions.Transaction(transfer.fromUser, transfer.amount, transfer.currency, transfer.toUser, 0, transfer.currency, admin.database.ServerValue.TIMESTAMP))
}

async function deleteTransfer(id: string) {
    await admin.database().ref("transfers/" + id).remove()
}

class Transfer {
    public amount: number
    public currency: string
    public fromUser: string
    public toUser: string
}