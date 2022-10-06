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

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent implements OnInit {
  registro: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService,
    private router: Router,
    private firebaseError: FirebaseErrorCodeService,
  ) {
    this.registro = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      repetirPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  registrar() {
    const email = this.registro.value.email;
    const password = this.registro.value.password;
    const repetirPassword = this.registro.value.repetirPassword;

    if (password !== repetirPassword) {
      this.toastr.error('Las contraseñas deben coincidir', 'Error');
      return;
    }

    this.loading = true;
    this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.loading = false;
        this.router.navigate(['/login']);
        this.toastr.success('El usuario fue registrado exitosamente!', 'Registro exitoso');
      })
      .catch((error) => {
        this.loading = false;
        this.toastr.error(this.firebaseError.errorCode(error.code), 'Error');
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

// registro() {
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
