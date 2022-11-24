 /**
   * Herramienta que permite la conversion de segundos a un formato legible en horas, minutos y segundos
   * 
   * @param seconds - cantidad de segundos, lo recibe segun la API de zabbix
   * @returns un string con el formato convertido y legible
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  export function formatoUptime(seconds: number) {

    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);

    let dDisplay = d > 0 ? d + (d == 1 ? " dia, " : " dias, ") : "";
    let hDisplay = h > 0 ? h + (h == 1 ? " hora, " : " horas, ") : "";
    let mDisplay = m > 0 ? m + (m == 1 ? " minuto, " : " minutos, ") : "";
    let sDisplay = s > 0 ? s + (s == 1 ? " segundo" : " segundos") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    /**
   * Este metodo crea un arreglo de opciones que seran devueltos a la metodo que llama esta para ser asignados a un grafico tipo radial
   * La estructura corresponde a un arreglo valido de opciones para un grafico de ApexCharts.
   *
   * @param id - String para identificar el grafico de manera interna.
   * @param etiqueta - String que se muestra en el grafico ya dibujado.
   * @param simbolo - Caracter que se muestra junto al valor del grafico, se utiliza "%"  y "°C".
   *
   * @returns Arreglo parcial en formato json con las opciones construidas para un tipo de grafico.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  export function defineGraficoRadial(id: string, etiqueta: string, simbolo: string): Partial<any> {
    let grafico = {
      series: [0],
      title: {
        align: "center"
      },
      chart: {
        id: id,
        offsetX: -35,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        height: 200,
        width: 200,
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
            background: "#ccc",
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
            background: "#a3a3a3",
            strokeWidth: "67%",
            margin: 0,
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
              formatter: function (val: { toString: () => string; }) {
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
      labels: [etiqueta],
      autoUpdateSeries: true

    };
    return grafico;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
   * Este metodo crea un arreglo de opciones que seran devueltos a la metodo que llama esta para ser asignados a un grafico tipo ranura
   * La estructura corresponde a un arreglo valido de opciones para un grafico de ApexCharts.
   *
   * @param id - String para identificar el grafico de manera interna.
   *
   * @returns Arreglo parcial en formato json con las opciones construidas para un tipo de grafico.
   */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  export function defineGraficoRanura(id: string): Partial<any> {
    let res = {
      series: [],
      chart: {
        height: 350,
        type: "area",
        id: id,

        zoom: {
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
        min: Date.now() - 86400000,
        max: Date.now(),
        labels: {
          datetimeUTC: false
        }
      },

      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      title: {
        text: "Trafico de red (Bits/s)"
      }

    };
    return res;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  /**
     * Esta metodo crea un arreglo de opciones que seran devueltos a la metodo que llama esta para ser asignados a un grafico tipo radial compacto
     * La estructura corresponde a un arreglo valido de opciones para un grafico de ApexCharts.
     * A diferencia del grafico radial no compacto es que este tiene preestablecidas las etiquetas para cada campo monitoreado,
     * y solo se actualizan los datos asociados a estas etiquetas.
     * Para la unidad de medida por defecto se imprime el simbolo "%", para el campo con indice 3 (temperatura) se imprime "°C"
     *
     * @param id - String para identificar el grafico de manera interna.
     * @param titulo - Es el nombre del host para poder identificar a cual grafico corresponde
     * @returns Arreglo parcial en formato json con las opciones construidas para un tipo de grafico.
     */
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  export function defineGraficoRadialCompacto(id: string): Partial<any> {
    let grafico = {
      series: [0, 0, 0, 0],
      chart: {
        id: id,
        height: 390,
        redrawOnParentResize: false,
        type: "radialBar"
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: 0,
          endAngle: 270,
          hollow: {
            margin: 40,
            size: "30%",
            background: "#ff0000",
            image: undefined
          },
          dataLabels: {
            name: {
              show: false
            },
            value: {
              show: false
            }
          }
        }
      },
      colors: ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
      labels: ['RAM', 'CPU', 'Disco', 'Temp'],
      title: {
        text: "",
        offsetY: 25,
        offsetX: 60,
        style: {
          fontSize: "20px"
        }
      },
      legend: {
        show: true,
        floating: true,
        fontSize: "16px",
        position: "left",
        horizontalAlign: 'center',
        offsetX: -30,
        offsetY: 20,
        labels: {
          useSeriesColors: true
        }, formatter: function (seriesName: string, opts: { w: { globals: { series: { [x: string]: string; }; }; }; seriesIndex: string | number; }) {
          if (opts.seriesIndex == 3) return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "°C";
          return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
        },
        itemMargin: {
          horizontal: 3
        }
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false
            }
          }
        }
      ]
    };
    return grafico;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////