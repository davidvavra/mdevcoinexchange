import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { registerLocaleData } from '@angular/common';
import localeCs from '@angular/common/locales/cs';
import { OffersComponent } from './offers/offers.component';
import { environment } from '../environments/environment';
import { NewOfferComponent } from './new-offer/new-offer.component';
import { NewTransferComponent } from './new-transfer/new-transfer.component';
import { CurrencyPickerComponent } from './currency-picker/currency-picker.component';
import { GraphsComponent } from './graphs/graphs.component';
import { NewCashOutComponent } from './new-cash-out/new-cash-out.component';
import { RulesComponent } from './rules/rules.component';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { RouterModule, Routes } from '@angular/router';
import { NavigationLoginComponent } from './navigation-login/navigation-login.component';
import { CashOutsComponent } from './cash-outs/cash-outs.component';
import { MyTransactionsComponent } from './my-transactions/my-transactions.component';
import { TvComponent } from './tv/tv.component';
import { LatestTransactionsComponent } from './latest-transactions/latest-transactions.component';
import { LatestOffersComponent } from './latest-offers/latest-offers.component';
import { CoinsOwnedByAttendeesComponent } from './coins-owned-by-attendees/coins-owned-by-attendees.component';
import { RatesComponent } from './rates/rates.component';

registerLocaleData(localeCs, 'cs');

const appRoutes: Routes = [
  { path: 'tv', component: TvComponent },
  { path: 'cash-outs', component: CashOutsComponent},
  { path: '**', component: NavigationLoginComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    OffersComponent,
    NewOfferComponent,
    NewTransferComponent,
    CurrencyPickerComponent,
    GraphsComponent,
    NewCashOutComponent,
    RulesComponent,
    NavigationLoginComponent,
    CashOutsComponent,
    MyTransactionsComponent,
    TvComponent,
    LatestTransactionsComponent,
    LatestOffersComponent,
    CoinsOwnedByAttendeesComponent,
    RatesComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
