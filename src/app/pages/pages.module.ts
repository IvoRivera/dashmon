import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { InventarioComponent } from './inventario/inventario.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule} from '@angular/material/icon'; 



@NgModule({
  declarations: [
    DashboardComponent,
    PagesComponent,
    InventarioComponent,
    CreateItemComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgApexchartsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,

  ],
  exports: [
    DashboardComponent,
  ]
})
export class PagesModule { }
