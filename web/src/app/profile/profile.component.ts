import { Component, OnInit } from '@angular/core';
import { Balance, BalancesAndTotal } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from 'angularfire2/auth';
import { setTimeoutNonBlocking } from '@firebase/database/dist/esm/src/core/util/util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  balances: Observable<Balance[]>
  total: Observable<number>
  userId: String
  noPassword: Observable<boolean>
  offline = false

  constructor(public db: AngularFireDatabase, public auth: AngularFireAuth) {
  }

  ngOnInit() {
    this.userId = this.auth.auth.currentUser.uid;

    this.balances = combineLatest(
      this.db.object("balances/" + this.userId).valueChanges(),
      this.db.object("averageRatesInCzk/latest").valueChanges(),
      (balances, rates) => {
        return [
          new Balance("ADC", "Android Dev Coin", balances["ADC"], rates["ADC"]),
          new Balance("IDC", "iOS Dev Coin", balances["IDC"], rates["IDC"]),
          new Balance("XPC", "Cross Platform Coin", balances["XPC"], rates["XPC"])
        ]
      }
    )
    this.total = this.balances.map(balances =>
      balances.map(balance => this.valueInCzk(balance))
        .reduce((sum, current) => sum + current)
    )
    this.noPassword = this.db.object("users/" + this.userId + "/password").valueChanges().map(
      password => (password == null || password == "")
    );
    setTimeout(() => {
      this.db.object(".info/connected").valueChanges().subscribe(
        value => {
          this.offline = value != null && value == false
        }
      )
    }, 1000)
  }

  valueInCzk(balance: Balance) {
    return balance.amount * balance.exchangeRateToCzk
  }

  abbrClicked(balance: Balance) {
    alert(balance.coinCode + " = " + balance.coinName)
  }

  protectClicked() {
    var password = prompt("Anyone can access your coins if they get private key from your badge. Add a password to protect it:")
    if (password != null) {
      this.db.object("users/" + this.userId).update({ password: password })
    }
  }

}
