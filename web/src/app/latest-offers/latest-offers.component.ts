import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Offer } from '../model';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-latest-offers',
  templateUrl: './latest-offers.component.html',
  styleUrls: ['./latest-offers.component.css']
})

export class LatestOffersComponent implements OnInit {

  // Max number of items to show
  maxItems = 5
  offers: Observable<Offer[]>

  constructor(public db: AngularFireDatabase) {}

  ngOnInit() {
    this.offers = this.db.list<Offer>("offers", ref => ref.limitToLast(this.maxItems)).valueChanges().map(list => {
      return list.reverse()
    })
  }

}
