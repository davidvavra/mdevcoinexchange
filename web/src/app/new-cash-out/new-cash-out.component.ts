import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CashOut, Balance } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'app-new-cash-out',
  templateUrl: './new-cash-out.component.html',
  styleUrls: ['./new-cash-out.component.css']
})
export class NewCashOutComponent implements OnInit {

  cashOut = new CashOut(0, "")
  @Output() created = new EventEmitter();
  loading = false
  error = false
  balance: Observable<number>
  userId: string

  constructor(public db: AngularFireDatabase, auth: AngularFireAuth) {
    this.userId = auth.auth.currentUser.uid
    this.cashOut.userId = this.userId
  }

  ngOnInit() {
    this.balance = combineLatest(
      this.db.object("balances/" + this.userId).valueChanges(),
      this.db.object("averageRatesInCzk/latest").valueChanges(),
      (balances, rates) => {
        let sum = balances["ADC"] * rates["ADC"]
        sum += balances["IDC"] * rates["IDC"]
        sum += balances["XPC"] * rates["XPC"]
        return sum
      }
    )
  }

  onSubmit() {
    let confirmation = confirm("Please confirm to cash out "+this.cashOut.amountInCzk+" CZK")
    if (confirmation == true) {
      this.loading = true
      this.error = false
      var cashOutId = this.db.list("cashOuts").push(this.cashOut).key
      this.db.object("cashOuts/" + cashOutId + "/validated").valueChanges().subscribe(
        value => {
          if (value == true) {
            this.created.emit()
          }
        }
      )
      this.db.object("cashOuts/" + cashOutId).valueChanges().subscribe(
        value => {
          if (value == null) {
            this.error = true
            this.loading = false
          }
        }
      )
    }
  }

}
