import { Component, OnInit } from '@angular/core';
import { Offer, OfferInList } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit {

  offers: Observable<Offer[]>
  filterOffers = new BehaviorSubject("ALL")
  filterFor = new BehaviorSubject("ALL")
  loading = false
  userId: string

  constructor(public db: AngularFireDatabase, public auth: AngularFireAuth) {
    this.userId = this.auth.auth.currentUser.uid
  }

  ngOnInit() {
    this.offers = combineLatest(
      this.db.list<Offer>("offers", ref => ref.orderByChild("oneOfferedCoinInCzk")).snapshotChanges(),
      this.db.object("balances/" + this.userId).valueChanges(),
      this.filterOffers,
      this.filterFor,
      (offers, balances, filterSells, filterFor) => {
        return offers.map(snapshot => {
          let val = snapshot.payload.val()
          let own = (val["sellerId"] == this.userId)
          let canBuy = balances[val["currencyRequired"]] >= val["amountRequired"] || own
          return new OfferInList(snapshot.key, val["amountOffered"], val["amountRequired"], val["currencyOffered"], val["currencyRequired"], val["sellerId"], val["oneOfferedCoinInCzk"], canBuy, own)
        }).filter(
          offer => {
            return (filterSells == "ALL" || offer.currencyOffered == filterSells)
              && (filterFor == "ALL" || offer.currencyRequired == filterFor)
          }
        )
      }
    )
  }

  filterOffersChanged(currency) {
    this.filterOffers.next(currency)
  }

  filterForChanged(currency) {
    this.filterFor.next(currency)
  }

  buyOrCancelClicked(offer) {
    if (offer["own"] == true) {
      let confirmation = confirm("Press OK to cancel your offer")
      if (confirmation == true) {
        this.loading = true
        this.db.object("offers/" + offer.id).remove()
        this.loading = false
      }
    } else {
      let confirmation = confirm("Please confirm purchasing " + offer["amountOffered"] + " " + offer["currencyOffered"] + " for " + offer["amountRequired"] + " " + offer["currencyRequired"])
      if (confirmation == true) {
        this.loading = true
        this.db.object("offers/" + offer.id).update({ buyerId: this.auth.auth.currentUser.uid });
        this.db.object("offers/" + offer.id + "/buyerId").valueChanges().subscribe(
          buyerId => {
            if (buyerId == null) {
              this.loading = false
            }
          }
        )
      }
    }
  }

}
