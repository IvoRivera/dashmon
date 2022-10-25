import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { ItemService } from '../../../services/firebase/item.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  items: any[] = [];

  constructor(private _itemService: ItemService,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.getItems();
  }

  getItems() {
    this._itemService.getItems().subscribe(data => {
      data.forEach(( element: any ) => {
        this.items.push({
          id: element.payload.doc.id,
          ...element.payload.doc.data()
        })
      });
      console.log(this.items);
    });
  }

  eliminarItem(id: string) {
    this._itemService.eliminarItem(id).then(() => {
      console.log('item eliminado exitosamente!');
      this.toastr.warning('El item ha sido eliminado exitosamente!', 'Item eliminado', {
        positionClass: 'toast-bottom-right'
      });
    }).catch(error =>
      console.log(error));
  }

}
