import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit {
  createItem: FormGroup;
  submitted = false;

  constructor( private fb: FormBuilder,
               private _itemService: ItemService,
               private router: Router) {
    this.createItem = this.fb.group({
      id: ['', Validators.required],
      nombre: ['', Validators.required],
      cantidad: ['', Validators.required],
      descripcion: ['', Validators.required]
   })
  }

  ngOnInit(): void {
  }

  agregarItem() {
    this.submitted = true;

    if( this.createItem.invalid ){
      return;
    }
    const item: any = {
      id: this.createItem.value.id,
      nombre: this.createItem.value.nombre,
      cantidad: this.createItem.value.cantidad,
      descripcion: this.createItem.value.descripcion,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }

    this._itemService.agregarItem(item).then(() => {
      console.log('Item agregado exitosamente!');
      this.router.navigate(['/inventario']);
    }).catch((error: any) =>{
      console.log(error);
    });
  }

}
