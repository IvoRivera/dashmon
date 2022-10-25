import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor ( private firestore: AngularFirestore ) { }

  agregarItem( item: any ): Promise<any> {
    return this.firestore.collection('items').add(item);
  }

  getItems(): Observable<any> {
    return this.firestore.collection('items', ref => ref.orderBy('fechaCreacion', 'asc')).snapshotChanges();
  }

  eliminarItem(id: string): Promise<any> {
    return this.firestore.collection('items').doc(id).delete();
  }

  getItem(id: string): Observable<any> {
    return this.firestore.collection('items').doc(id).snapshotChanges();
  }

  editarItem(id: string, data: any): Promise<any> {
    return this.firestore.collection('items').doc(id).update(data);
  }
}
