import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Personnel, InventoryItem, Vehicle, Assignment, HistoryRecord } from '../context/AppContext';

class FirebaseApiService {
  // Personnel API
  async getPersonnel(): Promise<Personnel[]> {
    const querySnapshot = await getDocs(query(collection(db, 'personnel'), orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Personnel[];
  }

  async createPersonnel(personnel: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> {
    const docRef = await addDoc(collection(db, 'personnel'), {
      ...personnel,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      ...personnel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updatePersonnel(id: string, personnel: Partial<Personnel>): Promise<Personnel> {
    const docRef = doc(db, 'personnel', id);
    await updateDoc(docRef, {
      ...personnel,
      updatedAt: Timestamp.now(),
    });
    
    return {
      id,
      ...personnel,
      updatedAt: new Date().toISOString(),
    } as Personnel;
  }

  async deletePersonnel(id: string): Promise<void> {
    await deleteDoc(doc(db, 'personnel', id));
  }

  // Inventory API
  async getInventory(): Promise<InventoryItem[]> {
    const querySnapshot = await getDocs(query(collection(db, 'inventory'), orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as InventoryItem[];
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const docRef = await addDoc(collection(db, 'inventory'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const docRef = doc(db, 'inventory', id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: Timestamp.now(),
    });
    
    return {
      id,
      ...item,
      updatedAt: new Date().toISOString(),
    } as InventoryItem;
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await deleteDoc(doc(db, 'inventory', id));
  }

  // Vehicles API
  async getVehicles(): Promise<Vehicle[]> {
    const querySnapshot = await getDocs(query(collection(db, 'vehicles'), orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Vehicle[];
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    const docRef = await addDoc(collection(db, 'vehicles'), {
      ...vehicle,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      ...vehicle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const docRef = doc(db, 'vehicles', id);
    await updateDoc(docRef, {
      ...vehicle,
      updatedAt: Timestamp.now(),
    });
    
    return {
      id,
      ...vehicle,
      updatedAt: new Date().toISOString(),
    } as Vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await deleteDoc(doc(db, 'vehicles', id));
  }

  // Assignments API
  async getAssignments(): Promise<Assignment[]> {
    const querySnapshot = await getDocs(query(collection(db, 'assignments'), orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Assignment[];
  }

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      id: docRef.id,
      ...assignment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
    const docRef = doc(db, 'assignments', id);
    await updateDoc(docRef, {
      ...assignment,
      updatedAt: Timestamp.now(),
    });
    
    return {
      id,
      ...assignment,
      updatedAt: new Date().toISOString(),
    } as Assignment;
  }

  async returnAssignment(id: string, returnDate: string, notes?: string): Promise<Assignment> {
    const docRef = doc(db, 'assignments', id);
    await updateDoc(docRef, {
      returnDate,
      status: 'returned',
      notes,
      updatedAt: Timestamp.now(),
    });
    
    return {
      id,
      returnDate,
      status: 'returned',
      notes,
      updatedAt: new Date().toISOString(),
    } as Assignment;
  }

  // History API
  async getHistory(): Promise<HistoryRecord[]> {
    const querySnapshot = await getDocs(query(collection(db, 'history'), orderBy('date', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as HistoryRecord[];
  }
}

export const firebaseApiService = new FirebaseApiService();