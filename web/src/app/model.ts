export class Balance {
    constructor(public coinCode: string, public coinName: string, public amount: number, public exchangeRateToCzk: number) {
    }
}

export class BalancesAndTotal {
    balances: Balance[];
    totalValue: number;
}

export class Rates {
    constructor(public ADC: number, public IDC: number, public XPC: number) {
    }
}

export class TimestampedRates {
    constructor(public timestamp: number, public rates: Rates) {
    }
}

export class Offer {
    constructor(public id: string, public amountOffered: number, public amountRequired: number, public currencyOffered: string, public currencyRequired: string, public sellerId: string, public oneOfferedCoinInCzk: number) {
    }
}
export class OfferInList {
    constructor(public id: string, public amountOffered: number, public amountRequired: number, public currencyOffered: string, public currencyRequired: string, public sellerId: string, public oneOfferedCoinInCzk: number, public canBuy: boolean, public own: boolean) {
    }
}

export class NewOffer {
    constructor(public amountOffered: number, public amountRequired: number, public currencyOffered: string, public currencyRequired: string, public sellerId: string) {
    }
}

export class NewTransfer {
    constructor(public amount: number, public currency: string, public fromUser: string, public toUser: string) { }
}

export class Transaction {
    constructor(public timestamp: number, public amountOffered: number, public currencyOffered: string, public amountRequired: number, public currencyRequired: string, public sellerId: string, public buyerId: string) { }
}

export class CashOut {
    constructor(public amountInCzk: number, public userId: string) { }
}

export interface SignInResponse {
    invalidPassword: boolean;
    invalidPrivateKey: boolean;
    token: string;
}