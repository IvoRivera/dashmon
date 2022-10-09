import {Component, OnInit} from '@angular/core';
import * as Highcharts from 'highcharts';
import {webSocket} from 'rxjs/webSocket';
import {of, Subscription} from 'rxjs';
import {concatMap, delay} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'dashmon';
  rate: any;  
  rate$: Subscription = new Subscription;
  Highcharts: typeof Highcharts = Highcharts;
  chardata: any[] = [];
  chartOptions: any;
  constructor(private http: HttpClient) { }
  postId:any;

  ngOnInit() {
    const headers = { "Content-Type": "application/json"};
    const body = {"jsonrpc": "2.0", "method": "history.get", "params":
    {
      "itemids": "42269",  
      "hostids":"10084",
      "sortfield": "clock",       
      "limit": 100,
      output    : "extend",
      history   : 0
    },
     "auth":"d3273299f72e3a2127f1a5139979c222","id":1};
    this.http.post<any>('http://192.168.1.25/api_jsonrpc.php', body, { headers }).subscribe(data => {
      console.log(data);
    })
  }
}
