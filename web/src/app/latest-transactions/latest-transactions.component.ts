import { Component, OnInit } from '@angular/core';
import { Transaction } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-latest-transactions',
  templateUrl: './latest-transactions.component.html',
  styleUrls: ['./latest-transactions.component.css']
})
export class LatestTransactionsComponent implements OnInit {

  // Max number of items to show
  maxItems = 5
  transactions: Observable<Transaction[]>

  constructor(public db: AngularFireDatabase) {}

  ngOnInit() {
    this.transactions = this.db.list<Transaction>("transactions", ref => ref.limitToLast(this.maxItems)).valueChanges().map(list => list.reverse())
  }

  formatRequired(transaction: Transaction) {
    return transaction.amountRequired == 0 ? "" : transaction.amountRequired.toFixed(5) + " " + transaction.currencyRequired
  }

}
