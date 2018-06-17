import { Component, OnInit, Input } from '@angular/core';
import { Rates, TimestampedRates } from '../model';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css']
})

export class GraphsComponent implements OnInit {

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
    chartFillAlpha: "42"
  }

  rates: TimestampedRates[] = []

  adcChart = null
  idcChart = null
  xpcChart = null
  combinedChart = null

  @Input()
  showTimePicker = true

  constructor(public db: AngularFireDatabase, public auth: AngularFireAuth) {
  }

  ngOnInit() {
    this.createCharts()

    // Latest rates
    this.db.object("averageRatesInCzk/latest").valueChanges().map(values => {
      return new Rates(values["ADC"], values["IDC"], values["XPC"])
    }).subscribe(rates => {
      document.getElementById("ADCTitle").innerHTML = "ADC = " + rates.ADC.toFixed(5) + " CZK"
      document.getElementById("IDCTitle").innerHTML = "IDC = " + rates.IDC.toFixed(5) + " CZK"
      document.getElementById("XPCTitle").innerHTML = "XPC = " + rates.XPC.toFixed(5) + " CZK"
    })

    // Historical chart data
    this.db.list<TimestampedRates>("averageRatesInCzk").stateChanges().subscribe(action => {
      if (action.type == 'child_added') {
        let timestampString = action.payload.key
        if (timestampString != 'latest') {
          let timestamp = parseInt(timestampString)
          let rate = new TimestampedRates(timestamp, action.payload.val())
          this.rates.push(rate)
          this.addChartRate(rate)
        }
      }
    })
  }

  // Menu

  selectedMenuItem = 0

  menuItems = [
    { id: 0, title: "30m" },
    { id: 1, title: "1h" },
    { id: 2, title: "3h" },
    { id: 3, title: "6h" },
    { id: 4, title: "All" },
  ]

  menuClicked(menuItem) {
    this.selectedMenuItem = menuItem.id

    switch (menuItem.id) {
      case 0:
        this.minChartTimestamp = this.currentTimestamp() - this.milisecondsIn.minute * 30
        break
      case 1:
        this.minChartTimestamp = this.currentTimestamp() - this.milisecondsIn.hour
        break
      case 2:
        this.minChartTimestamp = this.currentTimestamp() - this.milisecondsIn.hour * 3
        break
      case 3:
        this.minChartTimestamp = this.currentTimestamp() - this.milisecondsIn.hour * 6
        break
      case 4:
        this.minChartTimestamp = 0
        break
    }
    this.reloadChartData()
  }

  // Time

  milisecondsIn = {
    minute: 60 * 1000,
    hour: 3600 * 1000,
    day: 86400 * 1000
  }

  currentTimestamp() {
    return new Date().getTime() // getTime() returns time in milliseconds
  }

  // Updates

  minChartTimestamp: number = 0

  reloadChartData() {
    this.setChartRates(this.rates)
  }

  // Main method for setting new data
  setChartRates(rates: TimestampedRates[]) {
    this.removeAllChartData()
    this.addChartRatesAfterTimestamp(rates, this.minChartTimestamp)
  }

  // Main method for adding new data
  addChartRatesAfterTimestamp(rates: TimestampedRates[], minTimestamp: number) {
    rates.forEach((rate) => {
      if (rate.timestamp >= minTimestamp) {
        this.addChartRate(rate)
      }
    });
  }

  // Main method for adding new data
  addChartRate(rate: TimestampedRates) {
    this.addChartData(this.adcChart, rate.timestamp, rate.rates.ADC)
    this.addChartData(this.idcChart, rate.timestamp, rate.rates.IDC)
    this.addChartData(this.xpcChart, rate.timestamp, rate.rates.XPC)
    this.addCombinedChartRate(this.combinedChart, rate)
  }

  addChartData(chart, timestamp, value) {
    chart.data.labels.push(this.chartDateString(timestamp));
    chart.data.datasets.forEach((dataset) => {
      dataset.data.push(value);
    });
    chart.update();
  }

  addCombinedChartRate(chart: Chart, rate: TimestampedRates) {
    chart.data.labels.push(this.chartDateString(rate.timestamp));
    chart.data.datasets[0].data.push(rate.rates.ADC)
    chart.data.datasets[1].data.push(rate.rates.IDC)
    chart.data.datasets[2].data.push(rate.rates.XPC)
    chart.update();
  }


  removeAllChartData() {
    this.removeChartData(this.adcChart)
    this.removeChartData(this.idcChart)
    this.removeChartData(this.xpcChart)
    this.removeChartData(this.combinedChart)
  }

  removeChartData(chart) {
    chart.data.labels.length = 0
    chart.data.datasets.forEach((dataset) => {
      dataset.data.length = 0
    });
    chart.update();
  }

  removeLastChartData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
    });
    chart.update();
  }


  chartDateString(unix_timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    var date = new Date(unix_timestamp);
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    // Will display time in 10:30:23 format
    var formattedTime = hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime
  }

  // Colours

  chartFillColor(color) {
    return this.colorWithAlpha(color, this.color.chartFillAlpha)
  }

  colorWithAlpha(color, alpha) {
    return color + alpha
  }

  // Chart

  createCharts() {
    var adcTimestamps = []
    var idcTimestamps = []
    var xpcimestamps = []
    var adcValues = []
    var idcValues = []
    var xpcValues = []

    var adcContext = document.getElementById("ADCChart")
    var adcDataset = this.newDataset(adcValues, this.color.green, this.chartFillColor(this.color.green))
    var adcChart = this.newChart(adcContext, "ADC / CZK", adcTimestamps, adcDataset)
    this.adcChart = adcChart

    var idcContext = document.getElementById("IDCChart")
    var idcDataset = this.newDataset(idcValues, this.color.blue, this.chartFillColor(this.color.blue))
    var idcChart = this.newChart(idcContext, "IDC / CZK", idcTimestamps, idcDataset)
    this.idcChart = idcChart

    var xpcContext = document.getElementById("XPCChart")
    var xpcDataset = this.newDataset(xpcValues, this.color.yellow, this.chartFillColor(this.color.yellow))
    var xpcChart = this.newChart(xpcContext, "XPC / CZK", xpcimestamps, xpcDataset)
    this.xpcChart = xpcChart

    var adcCombinedDataset = this.newCombinedDataset("ADC", [], this.color.green)
    var idcCombinedDataset = this.newCombinedDataset("IDC", [], this.color.blue)
    var xdcCombinedDataset = this.newCombinedDataset("XPC", [], this.color.yellow)
    var combinedDatasets = [adcCombinedDataset, idcCombinedDataset, xdcCombinedDataset]
    var combinedContext = document.getElementById("CombinedChart")
    var combinedChart = this.newCombinedChart(combinedContext, [], combinedDatasets)
    this.combinedChart = combinedChart

    // Sample data
    // var r: TimestampedRates[] = []
    // r.push(new TimestampedRates(this.currentTimestamp() - this.secondsIn.hour * 10, new Rates(8,4,3)))
    // r.push(new TimestampedRates(this.currentTimestamp() - this.secondsIn.hour * 5, new Rates(14,9,5)))
    // r.push(new TimestampedRates(this.currentTimestamp() - this.secondsIn.hour * 2, new Rates(4,7,10)))
    // r.push(new TimestampedRates(this.currentTimestamp() - this.secondsIn.minute * 45, new Rates(2,5,8)))
    // r.push(new TimestampedRates(this.currentTimestamp() - this.secondsIn.minute * 10, new Rates(6,3,12)))
    // this.rates = r

    this.reloadChartData()
  }

  newDataset(yValues, lineColor, fillColor) {
    return {
      data: yValues,
      pointRadius: 0,
      lineTension: 0.1,
      borderWidth: 2,
      borderJoinStyle: "bevel",
      borderColor: lineColor,
      backgroundColor: fillColor,
      fill: true
    }
  }

  newChart(context, yLabel, xValues, dataset) {
    return new Chart(context, {
      type: 'line',
      data: {
        labels: xValues,
        datasets: [dataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          // datasets.label
          display: false
        },
        tooltips: {
          mode: 'index',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: false,
              color: this.color.lightGray
            },
            scaleLabel: {
              display: true
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: this.color.lightGray
            },
            scaleLabel: {
              display: true,
              labelString: yLabel
            }
          }]
        }
      }
    })
  }

  // Combined chart

  newCombinedDataset(label, yValues, lineColor) {
    return {
      label: label,
      data: yValues,
      pointRadius: 0,
      lineTension: 0.1,
      borderWidth: 2,
      borderJoinStyle: "bevel",
      borderColor: lineColor,
      fill: false
    }
  }

  newCombinedChart(context, xValues, datasets) {
    return new Chart(context, {
      type: 'line',
      data: {
        labels: xValues,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
          mode: 'index',
          intersect: false
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: this.color.lightGray
            }
          }],
          yAxes: [{
            display: true,
            gridLines: {
              display: true,
              color: this.color.lightGray
            },
            scaleLabel: {
              display: true,
              labelString: 'Value in CZK'
            }
          }]
        }
      }
    })
  }

}
