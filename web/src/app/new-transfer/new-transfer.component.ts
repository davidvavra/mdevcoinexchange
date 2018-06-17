import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NewTransfer } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/take'

@Component({
  selector: 'app-new-transfer',
  templateUrl: './new-transfer.component.html',
  styleUrls: ['./new-transfer.component.css']
})
export class NewTransferComponent implements OnInit {

  transfer = new NewTransfer(0, "ADC", "", "")
  @Output() created = new EventEmitter();
  loading = false
  error = false

  constructor(public db: AngularFireDatabase, auth: AngularFireAuth) {
    let userId = auth.auth.currentUser.uid
    this.transfer.fromUser = userId
    // Select currency with highest balance
    this.db.object("balances/" + userId).valueChanges().take(1).subscribe(
      balances => {
        let max = Math.max(balances["ADC"], balances["IDC"], balances["XPC"])
        if (max == balances["ADC"]) {
          this.transfer.currency = "ADC"
        } else if (max == balances["IDC"]) {
          this.transfer.currency = "IDC"
        } else if (max == balances["XPC"]) {
          this.transfer.currency = "XPC"
        }
      }
    )
  }

  ngOnInit() {
  }

  currencyChanged(currency) {
    this.transfer.currency = currency
  }

  onSubmit() {
    this.loading = true
    this.error = false
    var transferId = this.db.list("transfers").push(this.transfer).key
    this.db.object("transfers/" + transferId + "/validated").valueChanges().subscribe(
      value => {
        if (value == true) {
          this.created.emit()
        }
      }
    )
    this.db.object("transfers/" + transferId).valueChanges().subscribe(
      value => {
        if (value == null) {
          this.error = true
          this.loading = false
        }
      }
    )
  }

}
