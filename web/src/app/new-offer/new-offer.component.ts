import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NewOffer, Offer, Rates } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { NgForm } from '@angular/forms';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrls: ['./new-offer.component.css']
})
export class NewOfferComponent implements OnInit {

  offer = new NewOffer(1, 1, "ADC", "ADC", "")
  @ViewChild('newOfferForm') ngForm: NgForm;
  marketPrice: number;
  @Output() created = new EventEmitter();
  currencyChanged = new EventEmitter();
  loading = false
  marketPriceVisible = false
  error = false

  constructor(public db: AngularFireDatabase, auth: AngularFireAuth) {
    this.offer.sellerId = auth.auth.currentUser.uid
  }

  ngOnInit() {
    combineLatest(
      this.ngForm.form.valueChanges,
      this.currencyChanged,
      this.db.object("averageRatesInCzk/latest").valueChanges(),
      (formChanged, currencyChanged, rates) => {
        let priceOffered = this.offer.amountOffered * rates[this.offer.currencyOffered]
        this.marketPrice = priceOffered / rates[this.offer.currencyRequired]
      }).subscribe()
  }

  currencyOfferedChanged(currency) {
    this.offer.currencyOffered = currency;
    this.notifyCurrencyChange()
  }

  currencyRequiredChanged(currency) {
    this.offer.currencyRequired = currency;
    this.notifyCurrencyChange()
  }

  notifyCurrencyChange() {
    this.currencyChanged.emit();
    this.marketPriceVisible = this.offer.currencyOffered != this.offer.currencyRequired
  }

  onSubmit() {
    this.loading = true
    this.error = false
    var offerId = this.db.list("offers").push(this.offer).key
    this.db.object("offers/" + offerId + "/oneOfferedCoinInCzk").valueChanges().subscribe(
      value => {
        if (value != null) {
          this.created.emit()
        }
      }
    )
    this.db.object("offers/" + offerId).valueChanges().subscribe(
      value => {
        if (value == null) {
          this.error = true
          this.loading = false
        }
      }
    )
  }

}
