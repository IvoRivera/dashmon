import { Injectable } from '@angular/core';
import { map, Observable, retry } from 'rxjs';

import { DatosHosts } from '../../interfaces/datos-hosts';
import { HttpClient } from '@angular/common/http';




@Injectable({
  providedIn: 'root'
})

/**
 * Este servicio sirve para comunicarse con la API de Zabbix,
 * los metodos definidos permiten obtener datos sobre los host registrados o ingresar nuevos hosts y asignarles templates de datos (items).
 */
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class DataService {

  /**
   * El constructor define el cliente http necesario para el funcionamiento del servicio.
   * 
   * @param http - Cliente http para realizar las llamadas a la API.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(private http: HttpClient) { }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Estos objetos guardan la informacion para comunicarse al servidor,
   * son configurados durante el ciclo de vida del constructor del componente dashboard.
   * 
   * Se declaran los metodos setters y getters para cada campo, excepto el getter del token, porque deberia ser secreto
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  protected host: string;
  protected puerto: string;
  protected token: string;

  setHost(ip: string) {
    this.host = ip;
  }
  setPuerto(puerto: string) {
    this.puerto = puerto;
  }
  setToken(token: string) {
    this.token = token;
  }

  getHost() {
    return this.host;
  }
  getPuerto() {
    return this.puerto;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Este metodo obtiene todos los hosts registrados en el servidor mediante una llamada HTTP
   * 
   * @returns Un objeto observable con los datos obtenidos 
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getHosts(): Observable<any> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "host.get", "params":
      {
        output: "extend",
      },
      "auth": this.token, "id": id
    };

    return this.http.post<any>(url, req, { headers }).pipe(
      map(res => res.result),
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  



  /**
     * Este metodo obtiene un item puntual para determinar si existe o no
     * 
     * @returns Un objeto observable con los datos obtenidos 
     */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getItemLogs(hostId: number, tag:string): Observable<any> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "item.get", "params":
      {
        "hostids": hostId,
        "tags":[{
          "tag": tag,
          "operator":0
        }],


        output: "extend",
      },
      "auth": this.token, "id": id
    };

    return this.http.post<any>(url, req, { headers }).pipe(
      map(res => res.result),
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  


  /**
   * Este metodo obtiene todos los datos de un host segun su id
   * 
   * @param idZabbix - id del host del cual obtendremos los items o datos configurados en el servidor
   * @returns Un objeto observable con los datos obtenidos
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getDatosHosts(idZabbix: number): Observable<DatosHosts> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "item.get", "params":
      {
        "hostids": idZabbix,

        output: "extend",
      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * Obtiene los items correspondientes a informacion de red de un host 
   * 
   * @param idZabbix -  id del host del cual obtendremos los items o datos configurados en el servidor
   * @param io - direccion del trafico de red, puede ser "IN" o "OUT"
   * 
   * @returns Un objeto observable con los datos obtenidos
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getNetItems(idZabbix: number): Observable<DatosHosts> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "item.get", "params":

      {
        "hostids": idZabbix,
        output: "extend",
        "search": { "key_": "net.if" },
        "searchByAny": true
      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Obtiene el historial de los datos registrados en el item 
   * 
   * @param idZabbix - id del host del cual obtendremos los items o datos configurados en el servidor
   * @param itemid - id del item del cual obtendremos el historial
   * 
   * @returns Un extenso arreglo con todos los datos solicitados, esta ordenado por fecha y en orden ascendente
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getNetHistHosts(idZabbix: number, itemid: string): Observable<DatosHosts> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "history.get", "params":
      {
        "output": "extend",
        "history": 3,
        "hostids": idZabbix,
        "itemids": [itemid],
        "sortfield": "clock",
        "sortorder": "ASC",


      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * Obtiene los registros de un archivo log puntual configurado como un item de un host registrado en el servidor.
   * 
   * 
   * @param idZabbix 
   * @param codigo 
   * @returns 
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getLogs(idZabbix: number, itemid: string,limite:number): Observable<DatosHosts> {


    const id = 2;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "history.get", "params":
      {
        "output": "extend",
        "history": 2,
        "hostids": idZabbix,
        "itemids": itemid,
        "sortfield": "clock",
        "sortorder": "ASC",
        

      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Permite crear un host, los valores ingresados por parametro son obtenidos mediante un formulario
   * 
   * @param nombre - nombre del host a crear
   * @param iphost - direccion ip del host
   * @param tag - tag para clasificar el host 
   * 
   * @returns 
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  crearHost(nombre: string, iphost: string, tag: string): Observable<DatosHosts> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "host.create", "params":
      {
        "host": nombre,

        "groups": [{
          "groupid": "2"
        }],
        "tags": [{
          "tag": "Host name",
          "value": tag
        }],
        "templates": [{
          "templateid": "10001"
        }],
        "interfaces": [{
          "type": 1,
          "main": 1,
          "useip": 1,
          "ip": iphost,
          "dns": "",
          "port": "10050"
  
        }],
      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }


 /**
   * Permite eliminar un host, los valores ingresados por parametro son obtenidos
   *  desde el objeto que contiene los datos del host en el template html
   * 
   * @param hostid - id interno del host
   * 
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  eliminarHost(hostid: string): Observable<DatosHosts> {
    const id = 1;
    const url = this.host + this.puerto + '/api_jsonrpc.php';
    const headers = { "Content-Type": "application/json" };
    const req = {
      "jsonrpc": "2.0", "method": "host.delete", "params":
      {
        hostid
      },
      "auth": this.token, "id": id
    };
    return this.http.post<DatosHosts>(url, req, { headers }).pipe(
      retry(3))
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


}



