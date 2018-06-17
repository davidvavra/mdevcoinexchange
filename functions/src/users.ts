import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as transactions from './transactions'

export async function login(privateKey: string, password: string, response: functions.Response) {
    if (privateKey.trim() == "") {
        // Private key is empty
        sendResponse(new LoginResponse("", false, true), response)
        return
    }
    let uid = (await admin.database().ref("privateKeys/" + privateKey.toLowerCase()).once("value")).val()
    if (uid == null) {
        // Private key doesn't exist
        await delay(2000)
        sendResponse(new LoginResponse("", false, true), response)
        return
    }
    let dbPassword = (await admin.database().ref("users/" + uid + "/password").once("value")).val()
    if (dbPassword != null && dbPassword != password) {
        // Wrong password
        await delay(2000)
        sendResponse(new LoginResponse("", true, false), response)
        return
    }
    let balance = await getBalances(uid)
    if (balance == null) {
        // New user
        await admin.database().ref("balances/" + uid).set(new Balances(0, 0, 0))
        await transactions.createInitial("ADC", uid)
        await transactions.createInitial("IDC", uid)
        await transactions.createInitial("XPC", uid)
    }
    let token = await admin.auth().createCustomToken(uid)
    sendResponse(new LoginResponse(token, false, false), response)
}

export async function getBalance(uid: string, currency: string): Promise<number> {
    return (await admin.database().ref("balances/" + uid + "/" + currency).once("value")).val()
}

export async function getBalances(uid: string): Promise<Balances> {
    return (await admin.database().ref("balances/" + uid).once("value")).val()
}

export async function increaseBalance(uid: String, amount: number, currency: String) {
    await admin.database().ref("balances/" + uid + "/" + currency).transaction(current => {
        return (current || 0) + amount
    })
}

export async function decreaseBalance(uid: String, amount: number, currency: String) {
    await admin.database().ref("balances/" + uid + "/" + currency).transaction(current => {
        return (current || 0) - amount
    })
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

function sendResponse(loginResponse: LoginResponse, http: functions.Response) {
    http.setHeader('Access-Control-Allow-Origin', '*');
    http.setHeader('Access-Control-Request-Method', '*');
    http.setHeader('Access-Control-Allow-Headers', '*');
    http.writeHead(200)
    http.write(JSON.stringify(loginResponse))
    http.end()
}

class LoginResponse {
    constructor(public token: string, public invalidPassword: boolean, public invalidPrivateKey: boolean) { }
}

export class Balances {
    constructor(public ADC: number, public IDC: number, public XPC: number) { }
}