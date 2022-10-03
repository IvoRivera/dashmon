import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  signupForm!: FormGroup;
  firebaseErrorMessage: string;

  constructor(private authService: AuthService,
              private router: Router,
              private afAuth: AngularFireAuth) {
    this.firebaseErrorMessage = '';
  }

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      'alias': new FormControl('', Validators.required),
      'email': new FormControl('', Validators.required),
      'password': new FormControl('', Validators.required)
    });
  }

  registro() {
    if (this.signupForm.invalid)
      return;

    this.authService.signupUser(this.signupForm.value).then((result) => {
      if (result ==null)
        this.router.navigate(['/dashboard'])
      else if (result.isValid == false)
        this.firebaseErrorMessage = result.message;
    })
  }

}
