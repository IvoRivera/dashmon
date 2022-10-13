import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FirebaseErrorCodeService } from 'src/app/services/firebase-error-code.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  loading: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private firebaseError: FirebaseErrorCodeService,
    private router: Router
    ) {
  }

  registrar({ email, password, repetirPassword }: any) {
    return createUserWithEmailAndPassword(email, password, repetirPassword );
  }

  verificarCorreo() {
    this.afAuth.currentUser.then(user => user?.sendEmailVerification())
      .then(() => {
        this.toastr.info(
          'Se ha enviado un correo electronico para verificar su cuenta',
          'Verificar Correo'
        );
        this.router.navigate(['/login']);
      });
  }

  login({ email, password }: any) {

    this.loading = true;
    this.afAuth.signInWithEmailAndPassword(email, password).then((user) => {
      if(user.user?.emailVerified) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/verificar-correo']);
      }

    }).catch((error) => {
      this.loading = false;
      this.firebaseError.errorCode(error.code);
      this.toastr.error(this.firebaseError.errorCode(error.code), 'Error');
    })
  }

  logOut() {
    this.afAuth.signOut().then(() => this.router.navigate(['/login']))
  }

}
