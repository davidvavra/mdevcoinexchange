import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency-picker',
  templateUrl: './currency-picker.component.html',
  styleUrls: ['./currency-picker.component.css']
})
export class CurrencyPickerComponent implements OnInit {

  currencies = ["ADC", "IDC", "XPC"]

  @Output()
  selectedChange = new EventEmitter<string>()
  
  @Input()
  selected = "ADC"

  constructor() { }

  ngOnInit() {
  }

  currencyChanged(currency) {
    this.selected = currency;
    this.selectedChange.emit(currency);
  }

}
