import { Injectable } from '@angular/core';
import { FirebaseErrorCodeEnum } from '../../app/utils/firebase-error-code';

@Injectable({
  providedIn: 'root'
})
export class FirebaseErrorCodeService {

  constructor() { }

  errorCode(code: string) {
    switch (code) {
      // correo  invalido
      case FirebaseErrorCodeEnum.InvalidEmail:
        return 'Correo invalido';

      // El correo ya esta ingresado
      case FirebaseErrorCodeEnum.EmailAlredyInUse:
        return 'El usuario ya existe';

      // El usuario no existe en el sistema
      case FirebaseErrorCodeEnum.UserNotFound:
        return 'El usuario no existe';

      // contraseña incorrecta
      case FirebaseErrorCodeEnum.WorngPassword:
        return 'La contraseña ingresada no es correcta';

      // contraseña invalida
      case FirebaseErrorCodeEnum.InvalidPassword:
        return 'La contraseña debe tener mas de 6 caracteres';

      // contraseña debil
      case FirebaseErrorCodeEnum.WeakPassword:
        return 'La contraseña muy debil';

      // caso por defecto
      default:
        return 'Error desconocido';
    }
  }

}
