import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @ViewChild('password') passwordRef!: ElementRef;
  @ViewChild('togglePassword') togglePasswordRef!: ElementRef;

  loginForm = this.fb.group({
    email: [
      localStorage.getItem('email') || '',
      [Validators.required, Validators.email],
    ],
    password: ['', [Validators.required]],
    remember: [localStorage.getItem('remember') || ''],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authSvc: AuthService
  ) {}

  ngOnInit(): void {}

  // LOGIN CON GOOGLE
  // async onGoogleLogin() {
  //   try {
  //     await this.authSvc.loginGoogle().then(() => {
  //       this.router.navigateByUrl('dashboard');
  //     });
  //   } catch (error: any) {
  //     Swal.fire('ERROR', error.message, 'error');
  //   }
  // }

  async login() {
    try {
      await this.authSvc
        .login(this.loginForm.value.email!, this.loginForm.value.password!)
        .then((user) => {
          if (user && user.user.emailVerified) {
            this.router.navigateByUrl('/dashboard');
          } else if (user) {
            this.router.navigateByUrl('/verificar-email');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'El email o contraseña son incorrectos',
              confirmButtonText: 'Aceptar',
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                localStorage.removeItem('email');
                localStorage.removeItem('remember');
                this.loginForm.reset();
              }
            });
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  onCheckboxChhange(e: any) {
    if (
      this.loginForm.value.email === '' ||
      localStorage.getItem('email') === '' ||
      this.loginForm.value.password === null
    ) {
      Swal.fire('ERROR', 'Debe ingresar su email', 'error');
      localStorage.removeItem('email');
      localStorage.removeItem('remember');
    } else {
      if (e.target.checked) {
        localStorage.setItem('email', this.loginForm.value.email!);
        localStorage.setItem('remember', 'true');
      } else {
        this.loginForm.reset();
        localStorage.removeItem('email');
        localStorage.removeItem('remember');
      }
    }
  }

  hideShowPass() {
    const inputPass = this.passwordRef.nativeElement;
    const iconEye = this.togglePasswordRef.nativeElement;

    if (inputPass.getAttribute('type') === 'password') {
      inputPass.setAttribute('type', 'text');
      iconEye.classList.remove('fa-solid fa-eye-slash');
      iconEye.classList.add('fa-solid fa-eye');
    } else {
      inputPass.setAttribute('type', 'password');
      iconEye.classList.remove('fa-solid fa-eye');
      iconEye.classList.add('fa-solid fa-eye-slash');
    }
  }
}
