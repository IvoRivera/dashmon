import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.afAuth.signOut();
  }

}
