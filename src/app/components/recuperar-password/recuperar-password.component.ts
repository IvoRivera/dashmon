import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseErrorCodeService } from '../../../services/firebase/firebase-error-code.service';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.component.html',
  styleUrls: ['./recuperar-password.component.css']
})
export class RecuperarPasswordComponent implements OnInit {
  recuperarUsuario: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseErrorCodeService) {
      this.recuperarUsuario = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
      })
     }

  ngOnInit(): void {
  }

  recuperar(): void {
    const correo = this.recuperarUsuario.value.email;

    this.loading = true;
    this.afAuth.sendPasswordResetEmail(correo).then(() => {
      this.toastr.info('Se ha enviado un correo a la dirección indicada para restablecer su contraseña', 'Recuperar Contraseña')
      this.router.navigate(['/login']);

    }).catch((error) => {
      this.loading = false;
      this.toastr.error(this.firebaseError.errorCode(error.code), 'Error');
    })
  }

}
