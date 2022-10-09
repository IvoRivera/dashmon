import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Modulos
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {HttpClientModule} from '@angular/common/http';

import {HighchartsChartModule} from 'highcharts-angular';

// Componentes
import { AppComponent } from './app.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { environment } from 'src/environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    InventarioComponent,
    CreateItemComponent,
    SidenavComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    ReactiveFormsModule,
    HttpClientModule,
    HighchartsChartModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
