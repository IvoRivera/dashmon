import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ToastrService } from 'ngx-toastr';
import { FirebaseErrorCodeService } from 'src/app/services/firebase-error-code.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app/registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {
  formRegistro: FormGroup;
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseErrorCodeService,
  ) {
    this.formRegistro= this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repetirPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {

  }

  onSubmit () {
    this.userService.registrar(this.formRegistro.value).then(response => {
        console.log(response)
      })
      .catch(error => console.log(error));
  }






  registrar() {
    const email = this.formRegistro.value.email;
    const password = this.formRegistro.value.password;
    const repetirPassword = this.formRegistro.value.repetirPassword;

    if (password !== repetirPassword) {
      this.toastr.error('Las contraseñas deben coincidir', 'Error');
      return;
    }

    this.loading = true;
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.verificarCorreo();
      })
      .catch((error) => {
        this.loading = false;
        this.toastr.error(this.firebaseError.errorCode(error.code), 'Error');
      });
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

}

// signupForm!: FormGroup;
// firebaseErrorMessage: string;

// constructor(private authService: AuthService,
//             private router: Router,
//             private afAuth: AngularFireAuth) {
//   this.firebaseErrorMessage = '';
// }

// ngOnInit(): void {
//   this.signupForm = new FormGroup({
//     'alias': new FormControl('', Validators.required),
//     'email': new FormControl('', Validators.required),
//     'password': new FormControl('', Validators.required)
//   });
// }

// formRegistro() {
//   if (this.signupForm.invalid)
//     return;

//   this.authService.signupUser(this.signupForm.value).then((result) => {
//     if (result ==null)
//       this.router.navigate(['/dashboard'])
//     else if (result.isValid == false)
//       this.firebaseErrorMessage = result.message;
//   }).catch(() => {

//   });
// }
