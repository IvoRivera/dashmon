import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor ( private firestore: AngularFirestore ) { }

  agregarItem( item: any ): Promise<any> {
    return this.firestore.collection('items').add(item);
  }
}
