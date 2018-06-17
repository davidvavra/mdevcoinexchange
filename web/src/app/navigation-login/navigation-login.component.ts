import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpClient } from '@angular/common/http';
import { SignInResponse } from '../model';

@Component({
  selector: 'app-navigation-login',
  templateUrl: './navigation-login.component.html',
  styleUrls: ['./navigation-login.component.css']
})
export class NavigationLoginComponent {

  constructor(public firebaseAuth: AngularFireAuth, public http: HttpClient) {
    firebaseAuth.authState.subscribe((state) => {
      if (state == null) {
        this.showLogin = true
        this.showSignedIn = false
      } else {
        this.showLogin = false
        this.showSignedIn = true
      }
    })
  }

  menuItems = [
    {id: 0, title: "Offers"},
    {id: 1, title: "New Offer"},
    {id: 2, title: "Send coins"},
    {id: 3, title: "My ledger"},
    {id: 4, title: "Charts"},
    {id: 5, title: "Cash out"},
    {id: 6, title: "Rules"}
  ]
  selectedMenuItem = 0
  showPassword = false
  showLogin = false
  showSignedIn = false
  loading = false
  privateKeyError = false
  passwordError = false

  menuClicked(menuItem) {
    this.selectedMenuItem = menuItem.id
  }

  offerCreated() {
    this.selectedMenuItem = 0
  }

  transferCreated() {
    this.selectedMenuItem = 3
  }

  cashOutCreated() {
    this.selectedMenuItem = 3
  }

  login(privateKey, password) {
    this.loading = true
    this.privateKeyError = false
    this.passwordError = false
    let passwordValue = (password == undefined) ? "" : password.value
    this.http.get<SignInResponse>("https://us-central1-mdevcoinexchange.cloudfunctions.net/login?privateKey="+privateKey+"&password="+passwordValue).subscribe(
      (data: SignInResponse) => {
        if (data.invalidPassword) {
          this.loading = false
          if (this.showPassword == true) {
            this.passwordError = true
          }
          this.showPassword = true
          this.privateKeyError = false
        } else if (data.invalidPrivateKey) {
          this.loading = false
          this.showPassword = false
          this.privateKeyError = true
          this.passwordError = false
        } else {
          this.firebaseAuth.auth.signInWithCustomToken(data.token);
        }
      }
    )
  }

}
