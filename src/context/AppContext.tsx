import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface Personnel {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  value: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  type: string;
  inventoryItems: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  vehicleId: string;
  personnelId: string;
  assignDate: string;
  returnDate?: string;
  status: 'active' | 'returned';
  notes?: string;
  inventoryItems?: string[]; // Araçla birlikte zimmetlenen envanter öğeleri
  createdAt: string;
  updatedAt: string;
}

export interface HistoryRecord {
  id: string;
  type: 'assignment' | 'return' | 'inventory_change' | 'vehicle_update';
  entityId: string;
  changes: any;
  date: string;
  user: string;
}

interface AppState {
  personnel: Personnel[];
  inventory: InventoryItem[];
  vehicles: Vehicle[];
  assignments: Assignment[];
  history: HistoryRecord[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PERSONNEL'; payload: Personnel[] }
  | { type: 'ADD_PERSONNEL'; payload: Personnel }
  | { type: 'UPDATE_PERSONNEL'; payload: Personnel }
  | { type: 'DELETE_PERSONNEL'; payload: string }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY'; payload: string }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'SET_HISTORY'; payload: HistoryRecord[] }
  | { type: 'ADD_HISTORY'; payload: HistoryRecord };

const initialState: AppState = {
  personnel: [],
  inventory: [],
  vehicles: [],
  assignments: [],
  history: [],
  loading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PERSONNEL':
      return { ...state, personnel: action.payload };
    case 'ADD_PERSONNEL':
      return { ...state, personnel: [...state.personnel, action.payload] };
    case 'UPDATE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PERSONNEL':
      return {
        ...state,
        personnel: state.personnel.filter(p => p.id !== action.payload),
      };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'ADD_INVENTORY':
      return { ...state, inventory: [...state.inventory, action.payload] };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.map(i =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    case 'DELETE_INVENTORY':
      return {
        ...state,
        inventory: state.inventory.filter(i => i.id !== action.payload),
      };
    case 'SET_VEHICLES':
      return { ...state, vehicles: action.payload };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(v =>
          v.id === action.payload.id ? action.payload : v
        ),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(v => v.id !== action.payload),
      };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map(a =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    case 'ADD_HISTORY':
      return { ...state, history: [...state.history, action.payload] };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};