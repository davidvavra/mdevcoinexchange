import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Chart } from 'chart.js';
import { Rates } from '../model';

@Component({
  selector: 'app-coins-owned-by-attendees',
  templateUrl: './coins-owned-by-attendees.component.html',
  styleUrls: ['./coins-owned-by-attendees.component.css']
})

export class CoinsOwnedByAttendeesComponent implements OnInit {

  chart = null

  constructor(public db: AngularFireDatabase) {}

  ngOnInit() {
    this.createCharts()

    this.db.object("coinsOwnedByAttendees").valueChanges().map( values => {
      return new Rates(values["ADC"], values["IDC"], values["XPC"])
    }).subscribe(rates => {
      this.setRatesTitle(rates)
      this.setChartRates(this.chart, rates)
    })
  }

  setRatesTitle(rates: Rates) {
    let title = document.getElementById("TotalCoinsTitle")
    let total = rates.ADC + rates.IDC + rates.XPC
    title.innerHTML =  total.toFixed(0) + " total coins"
  }

  setChartRates(chart, rates) {
    chart.data.labels[0] = rates.ADC.toFixed(0) + " ADC"
    chart.data.labels[1] = rates.IDC.toFixed(0) + " IDC"
    chart.data.labels[2] = rates.XPC.toFixed(0) + " XPC"
    chart.data.datasets.forEach((dataset) => {
        dataset.data[0] = rates.ADC
        dataset.data[1] = rates.IDC
        dataset.data[2] = rates.XPC
    });
    chart.update();
  }

  createCharts() {
    let labels = ["ADC", "IDC", "XPC"]
    let values = [1,1,1]
    let borderColours = [this.color.white, this.color.white, this.color.white]
    // let backgroundColours = [this.color.green, this.color.blue, this.color.yellow]
    let backgroundColours = [this.chartFillColor(this.color.green), this.chartFillColor(this.color.blue), this.chartFillColor(this.color.yellow)]

    let context = document.getElementById("TotalCoinsChart")
    let dataset = this.newPieChartDataset("Coins owned by attendees", values, borderColours, backgroundColours)
    let data = this.newPieChartData([dataset], labels)
    let chart = this.newPieChart(context, data, this.newPieChartOptions())

    this.chart = chart
  }

  newPieChart(context, data, options) {
    let config = {
			type: 'pie',
      data: data,
      options: options
    }
    return new Chart(context, config)
  }

  newPieChartData(datasets, labels) {
    return {
      datasets: datasets,
      labels: labels
    }
  }

  newPieChartDataset(label, values, borderColours, backgroundColours) {
    return {
      label: label,
      data: values,
      borderColor: borderColours,
      backgroundColor: backgroundColours
    }
  }

  newPieChartOptions() {
    return {
      responsive: true
    }
  }

  // Colours

  // Coinbase colours
  color = {
    white: "#ffffff",
    //lightGray: "#909ca9", // 144 156 169
    lightBWGray: "#aaaaaa",
    lightGray: "#f2f6f9", // 242 246 249
    gray: "#728aad", // 114 138 173
    darkGray: "#4e5b6b", // 78 91 107
    blue: "#3485da", // 52 133 218 // IDC
    darkBlue: "#045cca", // 4 92 202
    green: "#82bc48", // 130 188 72 // ADC
    yellow: "#ffa718", // 255 167 24 // XPC
    purple: "#6471b1", // 100 113 177
    chartFillAlpha: "dd"
  }

  chartFillColor(color) {
    return this.colorWithAlpha(color, this.color.chartFillAlpha)
  }

  colorWithAlpha(color, alpha) {
    return color + alpha
  }
}
