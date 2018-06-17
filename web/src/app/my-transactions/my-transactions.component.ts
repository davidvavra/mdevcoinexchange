import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Transaction } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-my-transactions',
  templateUrl: './my-transactions.component.html',
  styleUrls: ['./my-transactions.component.css']
})
export class MyTransactionsComponent implements OnInit {

  transactions: Observable<Transaction[]>
  userId: string

  constructor(public db: AngularFireDatabase, public auth: AngularFireAuth) { }

  ngOnInit() {
    this.userId = this.auth.auth.currentUser.uid;
    this.transactions = combineLatest(
      this.db.list<Transaction>("transactions", ref => ref.orderByChild("buyerId").equalTo(this.userId)).valueChanges(),
      this.db.list<Transaction>("transactions", ref => ref.orderByChild("sellerId").equalTo(this.userId)).valueChanges(),
      (myPurchases, mySells) => {
        return myPurchases.concat(mySells).sort((first, second) => second.timestamp - first.timestamp)
      })
  }

  formatRequired(transaction: Transaction) {
    return transaction.amountRequired == 0 ? "" : transaction.amountRequired + " " + transaction.currencyRequired
  }

}
