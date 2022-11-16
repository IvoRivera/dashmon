import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ProductosComponent } from './productos/productos.component';
import { AuthGuard } from '../guards/auth.guard';
import { InventarioComponent } from './inventario/inventario.component';
import { CreateItemComponent } from './create-item/create-item.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: PagesComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent,
        data: { titulo: 'Dashboard' },
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        data: { titulo: 'Usuarios' },
      },
      {
        path: 'productos',
        component: ProductosComponent,
        data: { titulo: 'Productos' },
      },
      {
        path: 'inventario',
        component: InventarioComponent,
        data: { titulo: 'Inventario' },
      },
      {
        path: 'create-item',
        component: CreateItemComponent,
        data: { titulo: 'Crear Item' },
      },
      {
        path: 'edit-item/:id',
        component: CreateItemComponent,
        data: { titulo: 'Editar Item' },
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
