import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from 'src/app/services/item.service';
import { ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { doc } from '@angular/fire/firestore';


@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css'],
})
export class InventarioComponent implements OnInit {

  @ViewChild('content', {static:false}) el!:ElementRef

  items: any[] = [];

  constructor(
    private _itemService: ItemService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getItems();
  }

  getItems() {
    this._itemService.getItems().subscribe(data => {
      this.items = [];
      data.forEach((element: any) => {
        this.items.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data(),
        });
      });
      console.log(this.items);
    });
  }

  eliminarItem(id: string) {
    this._itemService
      .eliminarItem(id)
      .then(() => {
        console.log('item eliminado exitosamente!');
        this.toastr.warning(
          'El item ha sido eliminado exitosamente!',
          'Item eliminado',
          {
            positionClass: 'toast-bottom-right',
          }
        );
      })
      .catch((error) => console.log(error));
  }

  generarPDF() {
      var pdf = new jsPDF()
      autoTable(pdf, {html: '#content'})
      pdf.save('inventario.pdf')
  }

}
