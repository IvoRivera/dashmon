import { Injectable } from '@angular/core';
import { catchError, Observable, retry, tap} from 'rxjs';

import { DatosHosts } from '../../interfaces/datos-hosts';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';




@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http:HttpClient) { }


  getHosts(): Observable<DatosHosts>{
    let id = 1;
    const url = 'http://192.168.1.25/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json"};
    const req = {"jsonrpc": "2.0", "method": "host.get", "params":
    {      
      //"hostids":"10541",      
      
      output    : "extend",      
    },
     "auth":"77de69615a4f78bc3f76ad1a2a7ce9a297244823f9373d3412a75dcc14f26699","id":id
    };            
    return  this.http.post<DatosHosts>(url, req, {headers}).pipe(
      retry(3))
  }
  

  getDatosHosts(): Observable<DatosHosts> {    
    let id = 1;
    const url = 'http://192.168.1.25/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json"};
    const req = {"jsonrpc": "2.0", "method": "item.get", "params":
    {      
      "hostids":"10541",      
      
      output    : "extend",      
    },
     "auth":"77de69615a4f78bc3f76ad1a2a7ce9a297244823f9373d3412a75dcc14f26699","id":id
    };            
    return  this.http.post<DatosHosts>(url, req, {headers}).pipe(
      retry(3))
  }

  getHistHosts(): Observable<DatosHosts> {    
    let id = 1;
    const url = 'http://192.168.1.25/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json"};
    const req = {"jsonrpc": "2.0", "method": "history.get", "params":
    {      
      "output": "extend",        
      "history": 3,
      "hostids":"10541",
      "itemids":[44251,44257],
      "sortfield": "clock",
      "sortorder": "ASC",
      
    },
     "auth":"77de69615a4f78bc3f76ad1a2a7ce9a297244823f9373d3412a75dcc14f26699","id":id
    };            
    return  this.http.post<DatosHosts>(url, req, {headers}).pipe(
      retry(3))
  }
}




