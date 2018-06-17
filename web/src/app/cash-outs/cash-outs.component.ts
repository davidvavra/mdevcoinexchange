import { Component, OnInit } from '@angular/core';
import { CashOut } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-cash-outs',
  templateUrl: './cash-outs.component.html',
  styleUrls: ['./cash-outs.component.css']
})
export class CashOutsComponent implements OnInit {

  cashOuts: Observable<CashOut[]>

  constructor(public db: AngularFireDatabase) {
  }

  ngOnInit() {
    this.cashOuts = this.db.list<CashOut>("cashOuts", ref => ref.orderByChild("validated").equalTo(true)).valueChanges().map(
      values => values.reverse()
    )
  }
}
