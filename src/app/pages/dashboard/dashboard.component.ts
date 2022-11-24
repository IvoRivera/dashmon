import { Component } from '@angular/core';
import { take } from 'rxjs';
import { DataService } from '../../services/dataAPI/data.service'
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CODIGOSREQ } from '../../utils/CODIGOS';
import * as ApexCharts from 'apexcharts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Hosts } from '../../../interfaces/hosts';
import { formatoUptime,defineGraficoRadial,defineGraficoRadialCompacto,defineGraficoRanura } from '../../utils/funcionesAuxiliares';




@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  /**
   * A continuacion se declaran y describen las variables globales utilizadas para el template html y componente.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  protected chartOptions: Partial<any>[][] = [[], [], [], [], [], [], [], [], [], []]; // Arreglo de opciones vacias para los graficos radiales y de ranuras.
  protected chartOptionsCompacto: Partial<any>[] = [];                                 // Arreglo de opciones vacios para los graficos radiales compactos.
  protected active = 1;                                                                // ID de la pestaña activa en los componentes modal.
  private flagGraficos: boolean = false;                                               // Flag para indicar que los graficos ya han sido creados y evitar que se inicialicen en cada actualizacion.
  private cargaInicial: boolean = true;                                                // Flag para indicar que las interfaces de red han sido identificadas y evitar que se dupliquen al cambiar de vista
  protected hosts: any[] = [];                                                         // Arreglo que contiene los datos de los host, es necesario para que se listen los nombres de los hosts.
  private modalRef: NgbModalRef;                                                       // Objeto que hace referencia al modal activo, es necesaria para abrir o cerrar el modal
  private closeResult = '';                                                            // Objeto necesario para el funcionamiento de los modal
  protected modoCompacto: boolean = false;                                             // Booleano para controlar el modo de vista entre compacto y extendido
  private arrayInterfacesIN: any[][] = []                                              // Array global que contiene las interfaces y host asociado para los datos de entrada
  private arrayInterfacesOUT: any[][] = []                                             // Array global que contiene las interfaces y host asociado para los datos de salida
  protected logs: any[] = [];                                                          // Arreglo que guarda temporalmente las entradas del log solicitado para descargarlo
  private nuevoHost: Hosts;                                                            // Objeto vacio a rellenar con los datos de un nuevo host al agregarlo por formulario.
  protected formularioNuevoHost: FormGroup;                                            // Formulario para agregar un nuevo host.
  protected formularioConexion: FormGroup;                                             // Formulario para agregar un nuevo host.
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * A continuacion se declaran y describen las constantes utilizadas para el funcionamiento del dashboard
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  private INTERVALOACTUALIZACION = 5000;                                                // Intervalo de actualizacion
  //private HOST = "http://192.168.1.15";   // Test                                     // Direccion del host servidor
  //private HOST = "http://100.100.100.2";  // Lab                                      // Direccion del host servidor
  //private PUERTO = ":80";                 // Test                                     // Puerto del servidor
  //private PUERTO = ":8080";               // Lab                                      // Puerto del servidor
  //private TOKEN = "15c21907aecb9c007bc270252bbadb6f0e181ceb58afeb8e42dae78cf7264b65"; // Test // Token de autorizacion
  //private TOKEN = "89a46f0f282ad3c45110c751062f21066eb1765131844c7eb3fdce28e7134285"; // Lab // Token de autorizacion
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






  /**
   * El servicioDatos llama los metodos para establecer la direccion ip del servidor, puerto y token de autenticacion.
   * En el constructor se declaran e inicializan los servicios para comunicarse con el backend, componentes modales y formularios.
   * Se declara e inicializa el formulario para conectarse a un servidor
   * Despues se declara e inicializa el formulario para agregar un nuevo host cuando se necesite.
   * Finalmente comprueba si existen datos de sesion guardados para iniciar la conexion con esos datos
   *
   * @param servicioDatos - Servicio para comunicarse con el backend.
   * @param modalService - Servicio para comunicarse con el componente modal.
   * @param fb - Facilitador para crear formularios.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  constructor(private servicioDatos: DataService, private modalService: NgbModal, public fb: FormBuilder) {
    this.formularioNuevoHost = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_]*$')]],
      ip: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$')]],
      tag: ['', [Validators.required, Validators.minLength(3)]],
    });
    this.formularioConexion = this.fb.group({
      ip: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(15), Validators.pattern('^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$')]],
      puerto: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(6), Validators.pattern('^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$')]],
      token: ['', [Validators.required, Validators.minLength(3)]],
    });
    if (sessionStorage.getItem("ip"))
      this.servicioDatos.setHost(sessionStorage.getItem("ip")!);
    if (sessionStorage.getItem("puerto"))
      this.servicioDatos.setPuerto(sessionStorage.getItem("puerto")!);
    if (sessionStorage.getItem("token"))
      this.servicioDatos.setToken(sessionStorage.getItem("token")!);

    this.initGraficos(this.INTERVALOACTUALIZACION);






  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * Luego de terminar el ciclo del constructor, se inicializan los graficos y se actualizan los datos cada 10 segundos por defecto.
   * Este metodo inicializa todos los graficos de los host disponibles y activos
   * Se utiliza el servicio declarado en el constructor para obtener todos los host,
   * para evitar problemas de rendimiento se usa take(1) para desuscribir el observable luego de tomar un solo conjunto de datos.
   * Se crean los graficos por cada host encontrado.
   * Despues se inicializan los graficos de red, por cada interfaz de red de cada host.
   * Se guardan los datos por host para mostrar los nombres en el frontend.
   * Si el host esta activo, entonces se obtienen sus datos para mostrarlos en los graficos.
   * Si esta activo el modo compacto solo se cargan los datos de los graficos radiales, si no se cargan los datos de red adicionalmente,
   * los datos de red se cargan cada un minuto, para afectar al rendimiento del dashboard.
   * Este metodo tambien verifica si se realizo una conexion correcta, invalida o incorrecta
   *
   * @param intervalo - numero en milisegundos en que se actualizan los datos
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  initGraficos(intervalo: number) {




    this.servicioDatos.getHosts().pipe(take(1)).subscribe({
      next: (arregloHosts) => {
        if (arregloHosts !== null && arregloHosts !== undefined) {
          console.log("Conexion correcta ✅✅✅");

          if (!this.flagGraficos) this.crearGraficos(arregloHosts.length);
          if (this.cargaInicial) this.setNetSeries();
          this.hosts = [];
          arregloHosts.forEach((host: any, i: number) => {
            console.log(host);
            this.hosts[i] = host;
            this.getIpHost(host.hostid, i);
            if (host.active_available == 1) {
              setInterval(() => this.servicioDatos.getItemByKey(host.hostid, [CODIGOSREQ.UPTIME]).subscribe(data => { this.hosts[i].uptime = formatoUptime(data.result[0].lastvalue) }), 1000)
              if (this.modoCompacto) {
                setInterval(() => this.getDatosRadialesCompacto(host.hostid, i), intervalo)
              } else {
                setInterval(() => {
                  this.getDatosRadiales(host.hostid, i);
                }, intervalo)
                setInterval(() => {
                  this.getDatosRanura(host.hostid, i);

                }, intervalo + 45000)
              }
            };
          });
        } else {
          console.log("Token invalido ❌");
        }
      },
      error: (error) => {
        console.info("No se ha podido conectar al servidor o no se han proporcionado credenciales ❌");
      },
      complete: () => console.info("Conexion completa ✅")
    }
    );
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


 


  /**
   * Este metodo obtiene la ip del host segun su id, busca entre todas las interfaces de red cual es la que utiliza para comunicarse 
   * con el servidor, es decir, la que tiene la propiedad "useip" activa.
   * 
   * @param hostid - id del host que solicita su ip.
   * @param indice - posicion del host en el array que los contiene a todos los demas.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getIpHost(hostid: number, indice: number) {
    this.servicioDatos.getInterfacesHosts(hostid).subscribe((res) => {
      res.result.forEach(element => {
        if (element.useip == "1") {
          this.hosts[indice].ip = element.ip
        }
      });
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Este metodo verifica si cada host esta activo o no, si lo esta, entonces obtiene los datos de red de sus interfaces.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  setNetSeries() {
    this.servicioDatos.getHosts().pipe(take(1)).subscribe({
      next: (arregloHosts) => {
        arregloHosts.forEach((host: any, i: number) => { //console.log(element);
          if (host.active_available == 1) {
            this.getSeries(host.hostid, i);
          };
        });
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.cargaInicial = false;
      }
    }
    )
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
     * Se crea una variable local para guardar la id del item que se esta buscando, en este caso, los datos de red
     * Se utilza el servicio para obtener los datos de red del host obtenido desde el backend,
     * los datos obtenidos usando este servicio se filtran segun los string "Bits sent" y "Bits received", esto es porque
     * hay otros datos en el arreglo obtenido.
     * Se puede optimizar configurando los items en las reglas de discovery en el servidor Zabbix quitando los items no utilizados.
     *
     * Para la entrada de datos que corresponde a los datos buscados se extrae el nombre de su host, id del item, direccion del trafico ("OUT" o "IN") y nombre de la interfaz.
     *
     * @param hostId - Id del host obtenida desde el backend
     * @param indice - Posicion del host dentro del arreglo que contiene todos los hosts registrados en el backend
     */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getSeries(hostid: number, indice: number): void {
    let itemid: string = "";
    this.servicioDatos.getNetItems(hostid).pipe(take(1)).subscribe(res => {
      for (let i = 0; i < res.result.length; i++) {
        if (JSON.stringify(res.result[i]).indexOf("Bits received") > 1) {
          itemid = res.result[i].itemid;
          let recorte = res.result[i].name.substring(0, res.result[i].name.indexOf(':'));
          let nombreInterfaz = recorte.substr(recorte.indexOf(" ") + 1);
          this.addDatosRanura(hostid, itemid, indice, "IN", nombreInterfaz);
          this.arrayInterfacesIN.push([nombreInterfaz, itemid, hostid]);
          itemid = "";
        } else if (JSON.stringify(res.result[i]).indexOf("Bits sent") > 1) {
          itemid = res.result[i].itemid;
          let recorte = res.result[i].name.substring(0, res.result[i].name.indexOf(':'));
          let nombreInterfaz = recorte.substr(recorte.indexOf(" ") + 1);
          this.addDatosRanura(hostid, itemid, indice, "OUT", nombreInterfaz);
          this.arrayInterfacesOUT.push([nombreInterfaz, itemid, hostid])
        }
        itemid = "";
      }


    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Se utilza el servicio para obtener los datos segun el id interno del host obtenido desde el backend.
   * Para cada grafico creado se actualizan sus datos, si el dato no se encuentra, se muestra el valor 0.
   *
   * @param hostId - Id del host obtenida desde el backend
   * @param indice - Posicion del host dentro del arreglo que contiene todos los hosts registrados en el backend
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getDatosRadiales(hostId: number, indice: number) {
    this.servicioDatos.getDatosHosts(hostId).pipe(take(1)).subscribe(datosHost => {
      //console.log(datosHost);

      ApexCharts.exec("graficoRAM" + indice + 0, "updateSeries",
        [(100 - Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.RAM).lastvalue) || undefined) ?
          100 - Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.RAM).lastvalue) : 0]);
      ApexCharts.exec("graficoCPU" + indice + 1, "updateSeries",
        [(Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.CPU).lastvalue) || undefined) ?
          Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.CPU).lastvalue) : 0]);
      ApexCharts.exec("graficoDISK" + indice + 2, "updateSeries",
        [(Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.DISK).lastvalue) || undefined) ?
          Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.DISK).lastvalue) : 0]);
      ApexCharts.exec("graficoTEMP" + indice + 3, "updateSeries",
        [(datosHost.result.find(e => e.key_ === CODIGOSREQ.TEMP) || undefined) ?
          datosHost.result.find(e => e.key_ === CODIGOSREQ.TEMP).lastvalue : 0]);


      // En todos los agentes cambiar este parametro UnsafeUserParameters = 1 y allowroot o algo asi en los de linux
      // en cada agente linux poner este UserParameter=cluster1.cpuTemperature,cat /sys/class/thermal/thermal_zone0/temp, quizas metodoe en el servidor principal
      // en los agentes windows poner  UserParameter=cluster1.cpuTemperature,powershell -nologo -command "Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | findstr "CurrentTemperature""
    })
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  /**
   * Se utilza el servicio para obtener los datos segun el id interno del host obtenido desde el backend.
   * Para cada grafico creado se actualizan sus datos, si el dato no se encuentra, se muestra el valor 0.
   *
   * @param hostId - Id del host obtenida desde el backend
   * @param indice - Posicion del host dentro del arreglo que contiene todos los hosts registrados en el backend
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getDatosRadialesCompacto(hostId: number, indice: number) {
    this.servicioDatos.getDatosHosts(hostId).pipe(take(1)).subscribe(datosHost => {
      ApexCharts.exec("graficoCompacto" + indice, "updateOptions", { plotOptions: { radialBar: { hollow: { background: '#00ff1c' } } } });
      ApexCharts.exec("graficoCompacto" + indice, "updateSeries", [
        (100 - Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.RAM).lastvalue)) ?
          (100 - Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.RAM).lastvalue)) : 0,
        (Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.CPU).lastvalue)) ?
          Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.CPU).lastvalue) : 0,
        (Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.DISK).lastvalue)) ?
          Math.floor(datosHost.result.find(e => e.key_ === CODIGOSREQ.DISK).lastvalue) : 0,
        (datosHost.result.find(e => e.key_ === CODIGOSREQ.TEMP)) ?
          datosHost.result.find(e => e.key_ === CODIGOSREQ.TEMP).lastvalue : 0]
      );
    })
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Se reinicia el grafico de red del host correspondiente al indice ingresado por parametro.
   * Se itera por cada interfaz de red del host para poblar nuevamente su grafico de red, esto se hace
   * tanto para el trafico entrante como saliente ("IN" y "OUT").
   *
   * @param hostId - Id del host obtenida desde el backend
   * @param indice - Posicion del host dentro del arreglo que contiene todos los hosts registrados en el backend
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getDatosRanura(hostid: number, indice: number): void {
    this.chartOptions[indice][4] = defineGraficoRanura("graficoNET" + indice + 4);
    this.arrayInterfacesIN.forEach(element => {
      if (element[2] == String(hostid))
        this.updateDatosRanura(hostid, element[1], indice, "IN", element[0]);
    });
    this.arrayInterfacesOUT.forEach(element => {
      if (element[2] == String(hostid))
        this.updateDatosRanura(hostid, element[1], indice, "OUT", element[0]);
    });
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Se crea un arreglo local para los valores y fechas correspondientes a los datos de red.
   * Se obtienen los datos desde el backend segun los parametros de entrada y se guardan en los arreglos correspondientes,
   * en el caso de las fechas, estan en UNIX Timestamp y deben ser multiplicadas por 1000 para convertirlas a un formato de fechas legible.
   * Se emparejan los valores y fechas en otro arreglo para ser agregado a las series de datos del grafico de red,
   * .
   * Se vacian los arreglos temporales por si existe otra interfaz de red con datos y estos no se superpongan a los anteriores.
   * Si bien se guardan todos los datos, solo se muestran los ultimos 200 por temas de visibilidad y zoom del grafico.
   * Para ver todos los datos obtenidos (90 dias maximo, segun la configuracion del servidor) hacer click en el simbolo de casa.
   *
   * @param hostid - id del host
   * @param itemid - id del item
   * @param indice - Indice del host en el arreglo principal
   * @param modo  - Direccion del trafico de red, si es entrante ("IN") o saliente ("OUT")
   * @param nombreInterfaz - Nombre de la interfaz, por ejemplo: ens33, wlan0, eth0...
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  addDatosRanura(hostid: number, itemid: string, indice: number, modo: string, nombreInterfaz: string) {
    let netVals: any[] = [];
    let netFechas: any[] = [];
    this.servicioDatos.getNetHistHosts(hostid, itemid).pipe(take(1)).subscribe((data) => { //console.log(data);
      data.result.forEach((element: any, i: number) => {
        netVals.push(element.value);
        netFechas.push(element.clock * 1000);
      });
      var arraydatos = [];
      var j = 0;
      while (j < netFechas.length) {
        arraydatos.push([netFechas[j], netVals[j]]);
        j++;
      }
      ApexCharts.exec("graficoNET" + indice + 4, "appendSeries", {
        name: modo + " [" + nombreInterfaz + "]",
        data: arraydatos.slice(-400)
      });
      netFechas = [];
      netVals = [];
    })
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
     * Se crea un arreglo local para los valores y fechas correspondientes a los datos de red.
     * Se obtienen los datos desde el backend segun los parametros de entrada y se guardan en los arreglos correspondientes,
     * en el caso de las fechas, estan en UNIX Timestamp y deben ser multiplicadas por 1000 para convertirlas a un formato de fechas legible.
     * Se emparejan los valores y fechas en otro arreglo para ser agregado a las series de datos del grafico de red,
     * .
     * Se vacian los arreglos temporales por si existe otra interfaz de red con datos y estos no se superpongan a los anteriores.
     * Si bien se guardan todos los datos, solo se muestran los ultimos 200 por temas de visibilidad y zoom del grafico.
     * Para ver todos los datos obtenidos (90 dias maximo, segun la configuracion del servidor) hacer click en el simbolo de casa.*
     *
     * @param hostid - id del host
     * @param itemid - id del item
     * @param indice - Indice del host en el arreglo principal
     * @param modo  - Direccion del trafico de red, si es entrante ("IN") o saliente ("OUT")
     * @param nombreInterfaz - Nombre de la interfaz, por ejemplo: ens33, wlan0, eth0...
     */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  updateDatosRanura(hostid: number, itemid: string, indice: number, modo: string, nombreInterfaz: string) {
    let netVals: any[] = [];
    let netFechas: any[] = [];
    this.servicioDatos.getNetHistHosts(hostid, itemid).pipe(take(1)).subscribe((data) => { //console.log(data);
      data.result.forEach((element: any, i: number) => {
        netVals.push(element.value);
        netFechas.push(element.clock * 1000);
      });
      var arraydatos = [];
      var j = 0;
      while (j < netFechas.length) {
        arraydatos.push([netFechas[j], netVals[j]]);
        j++;
      }

      ApexCharts.exec("graficoNET" + indice + 4, "appendSeries", {
        name: modo + " [" + nombreInterfaz + "]",
        data: arraydatos.slice(-400)
      });
      netFechas = [];
      netVals = [];
    })
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
    * Este metodo define y asigna las opciones iniciales para cada grafico segun su tipo y cantidad de host detectados.
    * Luego de haber creado todos los graficos se cambia el flag para evitar que se haga esto en cada actualizacion.
    * @param cantidadHosts - es la cantidad de host detectados por la metodo que llama esta.
    */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  crearGraficos(cantidadHosts: number) {   

    for (let i = 0; i < cantidadHosts; i++) {
      this.chartOptions[i][0] = defineGraficoRadial("graficoRAM" + i + 0, "RAM", "%");
      this.chartOptions[i][1] = defineGraficoRadial("graficoCPU" + i + 1, "CPU", "%");
      this.chartOptions[i][2] = defineGraficoRadial("graficoDISK" + i + 2, "Disk", "%");
      this.chartOptions[i][3] = defineGraficoRadial("graficoTEMP" + i + 3, "Temp", "°C");
      this.chartOptions[i][4] = defineGraficoRanura("graficoNET" + i + 4);

      this.chartOptionsCompacto[i] = defineGraficoRadialCompacto("graficoCompacto" + i)
    }
    this.flagGraficos = true;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Este metodo obtiene todos los items con el tag "log", luego filtra por los que no entregan erroes, es decir, los que son
   * compatibles con el host que esta solicitando el log.
   * Por cada log encontrado guardamos su nombre e id de item, con este ultimo se obtiene el log completo.
   * Cada entrada del array de respuesta se guarda como una linea que se va acumulando en un archivo que finalmente se descarga en texto plano .txt*
   *
   * @param hostid - id del host que pide el log
   *
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  public obtenerLogs(hostid: number) {
    this.servicioDatos.getItemLogs(hostid, "log").pipe(take(1)).subscribe((res) => {
      res.forEach((element: any) => {
        if (element.error == "") {
          let nombreLog = element.name;
          this.servicioDatos.getLogs(hostid, element.itemid).pipe(take(1)).subscribe((res) => {
            res.result.forEach((element: any, i: number) => {
              this.logs.push(element.value)
            });
            if (this.logs.length != 0) {
              let logs = this.logs.join('\r\n');
              var textToSave = logs;
              var hiddenElement = document.createElement('a');
              hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
              hiddenElement.target = '_blank';
              hiddenElement.download = nombreLog + '.txt';
              hiddenElement.click();
              this.logs = [];
            }
          })
        }
      }
      );
    }
    );
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Funcion generica para abrir un modal arbitrario
   *
   * Al abrir el modal para agrega un nuevo host se establece un tiempo de actualizacion de una hora, para impedir que los datos ingresados
   * se pierdan.
   * Si se ingresa el host correctamente o se cierra la ventana, se reinicia el intervalo a 15s.
   *
   * @param content - contenido que sera mostrado en el modal, este valor lo emite el template html
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  public abrirModal(content: any) {
    this.modalRef = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
    this.modalRef.result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Este metodo crea un nuevo host en base a los datos ingresados en el formulario,
   * si los datos son validos se crea un nuevo host y se actualizan los graficos
   *
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  agregarNuevoHost() {
    if (this.formularioNuevoHost.invalid) {
      this.formularioNuevoHost.markAllAsTouched();
      return;
    }
    this.nuevoHost = {
      nombre: this.formularioNuevoHost.get("nombre")?.value,
      ip: this.formularioNuevoHost.get("ip")?.value,
      tag: this.formularioNuevoHost.get("tag")?.value,

    }
    console.log(this.nuevoHost);
    this.servicioDatos.crearHost(this.formularioNuevoHost.get("nombre")?.value, this.formularioNuevoHost.get("ip")?.value, this.formularioNuevoHost.get("tag")?.value).subscribe(datos => {
      this.modalRef.close()
      this.formularioNuevoHost.reset();
    });
    this.flagGraficos = false;
    this.initGraficos(this.INTERVALOACTUALIZACION);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Simplemente resetea los campos del formulario de crear nuevo host
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  resetearCampos() {
    this.formularioNuevoHost.reset();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
     * Este metodo crea una conexion con el servidor segun los datos de direccion ip, puerto y token que se le ingresen 
     * por formulario. Tambien guarda estos datos para persistencia durante la sesion.
     *
     */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  realizarConexion() {
    if (this.formularioConexion.invalid) {
      this.formularioConexion.markAllAsTouched();
      return;
    }

    let ip = this.formularioConexion.get("ip")?.value;
    sessionStorage.setItem("ip", ip);

    let puerto = this.formularioConexion.get("puerto")?.value;
    sessionStorage.setItem("puerto", puerto)

    let token = this.formularioConexion.get("token")?.value;
    sessionStorage.setItem("token", token);



    console.log("IP: " + ip, "Puerto: " + puerto, "Token: **************************************************************");
    this.servicioDatos.setHost(ip);
    this.servicioDatos.setPuerto(puerto);
    this.servicioDatos.setToken(token);
    this.formularioConexion.reset();
    this.modalRef.close()
    this.flagGraficos = false;
    this.initGraficos(this.INTERVALOACTUALIZACION);
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Metodo nativo del navegador para comprobar si realmente queremos eliminar el host, esto lo hace mediente el servicio,
   * al cual le pasa la id del host que hemos seleccionado segun su elemento card en el html   *
   *
   * @param hostid - id del host
   * @param nombre - nombre del host
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  eliminarHost(hostid: number, nombre: string) {
    if (confirm("Seguro que quieres eliminar el host " + nombre)) {
      if (confirm("Esta accion es irreversible ¿Realmente quieres eliminarlo?")) {
        this.servicioDatos.eliminarHost(String(hostid)).subscribe((res) => console.log(res));
        this.flagGraficos = false;
        this.initGraficos(this.INTERVALOACTUALIZACION);
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




  /**
   *  Activa el modo oscuro segun las variables del archivo styles.css
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  onValChange() {
    document.body.classList.toggle('dark-theme');
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Es un switch simple que intercambia los estados de este booleano
   * para controlar el modo de visualizacion.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  cambiarTipoVista() {
    if (this.modoCompacto == true) {
      this.modoCompacto = false;
      this.initGraficos(this.INTERVALOACTUALIZACION);
    }
    else {
      this.modoCompacto = true;
      this.initGraficos(this.INTERVALOACTUALIZACION);
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
