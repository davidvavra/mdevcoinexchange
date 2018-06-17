import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Rates } from '../model';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-rates',
  templateUrl: './rates.component.html',
  styleUrls: ['./rates.component.css']
})

export class RatesComponent implements OnInit {

  rates: Observable<Rates>

  constructor(public db: AngularFireDatabase) {}

  ngOnInit() {
    this.rates = this.db.object("averageRatesInCzk/latest").valueChanges().map( values => {
      return new Rates(values["ADC"], values["IDC"], values["XPC"])
    })
  }

}
