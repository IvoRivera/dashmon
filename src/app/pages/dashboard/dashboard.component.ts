import { Component,ViewChild,OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';


import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexChart,
  ChartComponent,
  ApexTitleSubtitle,
  ApexFill,
  ApexStroke,
  
  
} from "ng-apexcharts";
import { Observable, take } from 'rxjs';
import { DatosHosts } from 'src/interfaces/datos-hosts';
import {DataService} from '../../../services/dataAPI/data.service'
import {Servidores} from '../../../interfaces/servidores'



export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;  
  fill: ApexFill;
  labels: string[];
  plotOptions: ApexPlotOptions;
  
};



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {  
  @ViewChild('graficoRAMM', {static: true}) chartRAM: ChartComponent;
  @ViewChild('graficoCPUU', {static: true}) chartCPU: ChartComponent;
  @ViewChild('graficoDISKK', {static: true}) chartDISK: ChartComponent;
  @ViewChild('graficoTEMPP', {static: true}) chartTEMP: ChartComponent;
  @ViewChild('graficoNETT', {static: true}) chartNET: ChartComponent;
  
  public graficoRAM: Partial<any> = {} as Partial<any>   
  public graficoCPU: Partial<any> = {} as Partial<any>;
  public graficoDISK: Partial<any> = {} as Partial<any>;
  public graficoTEMP: Partial<any> = {} as Partial<any>;
  public graficoNET: Partial<any> = {} as Partial<any>;
  
  
  private data$: Observable<DatosHosts>;
  private dataStatus$: Observable<DatosHosts>;

  private dataNetObs: Observable<DatosHosts>;
  private netInVals:any[] = [];
  private netInFechas:any[] = [];

  private netOutVals:any[] = [];
  private netOutFechas:any[] = [];


  public  listaServidores:Array<Servidores>| any = [];
  

  
  

  constructor(private servicioDatos: DataService) {
    this.getStatus();

    this.graficoRAM = this.crearGraficoRadial("graficoRAM","RAM","%");
    this.graficoCPU = this.crearGraficoRadial("graficoCPU","CPU","%");
    this.graficoDISK = this.crearGraficoRadial("graficoDISK","Disk","%");
    this.graficoTEMP = this.crearGraficoRadial("graficoTEMP","Temp","°C");
    this.graficoNET = this.crearGraficoSpline("IN","OUT");
  }  
  ngOnInit() {    
    setInterval(()=> this.getDatos(),1000);
    this.initHist();
  }
  
  getStatus(): void { 
    let i = 0;
    this.dataStatus$ = this.servicioDatos.getHosts();  
    this.dataStatus$.pipe(take(1)).subscribe((data)=> { 
      //console.log(data);
      
      data.result.forEach(element => {
        //console.log(element);
        
        if (element.status == 0) {
          this.listaServidores.push({
            id: i,
            nombre: element.host,
            estado: true,
          })
        } else {
          this.listaServidores.push({
            id: i,
            nombre: element.host,
            estado: false,
          })
          
        }
        i++
      });
      
    })
    
   }

  getDatos(): void { 
  this.data$ = this.servicioDatos.getDatosHosts();  
  this.data$.pipe(take(1)).subscribe((data)=> { 
    console.log(data);
    

    this.chartRAM.updateOptions({series:[Math.floor(data.result[19].lastvalue)]});    
    this.chartCPU.updateOptions({series:[Math.floor(data.result[7].lastvalue)]});    
    this.chartDISK.updateOptions({series:[Math.floor(data.result[17].lastvalue)]});    
    this.chartTEMP.updateOptions({series:[data.result[0].lastvalue]});    
  })
 }

 initHist():void{
  this.dataNetObs = this.servicioDatos.getHistHosts();  
  this.dataNetObs.pipe(take(1)).subscribe(async (data)=>{
    //console.log(data);
    
    data.result.forEach(element => {
      if (element.itemid == 44251) {
        this.netInVals.push(element.value);
        this.netInFechas.push(element.clock * 1000);
      } else {
        this.netOutVals.push(element.value);
        this.netOutFechas.push(element.clock * 1000);
      }
    });
    var arraydatosIn = [];
    var arraydatosOut = [];
    var i = 0;
    while (i < this.netInFechas.length) {
      arraydatosIn.push([this.netInFechas[i], this.netInVals[i]]);
      arraydatosOut.push([this.netOutFechas[i], this.netOutVals[i]]);
      i++;
    }
    
    await this.chartNET.updateOptions({series: [
      {
        name: "IN",
        data: arraydatosIn
      },
      {
        name: "Out",
        data: arraydatosOut
      }
    ],
    })
  })



 }
  
 crearGraficoRadial(id:string, label:string, simbolo:string): Partial<any>{   
       let res = {    
       series: [0],
       title:{        
         align: "center"
       },
       chart: {
         id: id,
         height: 200,
         width:200,
         type: "radialBar",
         toolbar: {
           show: false
         }
       },
       plotOptions: {
         radialBar: {
           startAngle: -135,
           endAngle: 225,
           hollow: {
             margin: 0,
             size: "70%",
             background: "#fff",
             image: undefined,
             position: "front",
             dropShadow: {
               enabled: true,
               top: 3,
               left: 0,
               blur: 4,
               opacity: 0.24
             }
           },
           track: {
             background: "#fff",
             strokeWidth: "67%",
             margin: 0, // margin is in pixels
             dropShadow: {
               enabled: true,
               top: -3,
               left: 0,
               blur: 4,
               opacity: 0.35
             }
           }, 
           dataLabels: {
             show: true,             
             name: {
               offsetY: -5,
               show: true,
               color: "#888",
               fontSize: "12px"
             },
             value: {   
                formatter: function(val: { toString: () => string; }) {
                  return parseInt(val.toString(), 10).toString() + simbolo;
                },           
               color: "#111",
               fontSize: "17px",
               show: true
             }
           }
         }
       },
       fill: {
         type: "gradient",
         gradient: {
           shade: "dark",
           type: "horizontal",
           shadeIntensity: 0.5,
           gradientToColors: ["#ABE5A1"],
           inverseColors: true,
           opacityFrom: 1,
           opacityTo: 1,
           stops: [0, 100]
         }
       },
       stroke: {
         lineCap: "round"
       },
       labels: [label],
       autoUpdateSeries: true
       
     };  
     return res;
    
 }

 crearGraficoSpline(input1:string, input2:string): Partial<any>{   
  let res = {
    series: [
      {
        name: input1,
        data: [[,]]
      },
      {
        name: input2,
        data:[[,]]
      }
    ],
    chart: {
      height: 350,
      type: "area",
      width: "250%",
      zoom:{
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      }

    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth"
    },
    xaxis: {
      type: "datetime",
      max:  Date.now(),
      labels: {
        datetimeUTC: false
      }
    },
    yaxis:{
      max: 1000,
      min:10
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm"
      }
    },
    title:{
      text: "Trafico de red (Bits/s)"
    }
    
  };
return res;
}
}