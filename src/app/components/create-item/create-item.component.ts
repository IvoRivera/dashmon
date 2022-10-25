import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ItemService } from '../../../services/firebase/item.service';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit {
  createItem: FormGroup;
  submitted = false;
  loading = false;
  id: string | null;
  titulo = 'Agregar item';

  constructor( private fb: FormBuilder,
               private _itemService: ItemService,
               private router: Router,
               private toastr: ToastrService,
               private aRoute: ActivatedRoute) {
    this.createItem = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      cantidad: ['', Validators.required],
      descripcion: ['', Validators.required]
   })
   this.id = this.aRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    this.esEditar()
  }

  agregarEditarItem() {
    this.submitted = true;

    if( this.createItem.invalid ){
      return;
    }

    if(this.id === null){
      this.agregarItem();
    }else{
      this.editarItem(this.id);
    }
  }

  agregarItem() {
    const item: any = {
      codigo: this.createItem.value.codigo,
      nombre: this.createItem.value.nombre,
      descripcion: this.createItem.value.descripcion,
      cantidad: this.createItem.value.cantidad,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    }
    this.loading = true;
    this._itemService.agregarItem(item).then(() => {
      this.toastr.success('El item se agregó exitosamente!', 'item agregado', {
        positionClass: 'toast-bottom-right',
      });
      this.loading = false;
      this.router.navigate(['/inventario']);
    }).catch((error: any) =>{
      console.log(error);
      this.loading = false;
    });
  }

  editarItem(id: string) {
    const item: any = {
      codigo: this.createItem.value.codigo,
      nombre: this.createItem.value.nombre,
      descripcion: this.createItem.value.descripcion,
      cantidad: this.createItem.value.cantidad,
      fechaActualizacion: new Date()
    }
    this.loading = true;
    this._itemService.editarItem(id, item).then(() => {
      this.loading = false;
      this.toastr.info('El item ha sido modificado exitosamente!', 'Item modificado', {
        positionClass: 'toast-bottom-right'
      })
      this.router.navigate(['/inventario']);
    })
  }

  esEditar() {
    this.titulo = 'Editar item'
    if(this.id !== null) {
      this.loading = true;
      this._itemService.getItem(this.id).subscribe(data => {
        this.loading = false;
        console.log(data.payload.data()['nombre']);
        this.createItem.setValue({
          codigo: data.payload.data()['codigo'],
          nombre: data.payload.data()['nombre'],
          descripcion: data.payload.data()['descripcion'],
          cantidad: data.payload.data()['cantidad'],
        })
      })
    }
  }
}
