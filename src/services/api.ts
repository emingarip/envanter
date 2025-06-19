import { Personnel, InventoryItem, Vehicle, Assignment, HistoryRecord } from '../context/AppContext';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Personnel API
  async getPersonnel(): Promise<Personnel[]> {
    return this.request<Personnel[]>('/personnel');
  }

  async createPersonnel(personnel: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> {
    return this.request<Personnel>('/personnel', {
      method: 'POST',
      body: JSON.stringify(personnel),
    });
  }

  async updatePersonnel(id: number, personnel: Partial<Personnel>): Promise<Personnel> {
    return this.request<Personnel>(`/personnel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personnel),
    });
  }

  async deletePersonnel(id: number): Promise<void> {
    return this.request<void>(`/personnel/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory API
  async getInventory(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/inventory');
  }

  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    return this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteInventoryItem(id: number): Promise<void> {
    return this.request<void>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Vehicles API
  async getVehicles(): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('/vehicles');
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
    return this.request<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicle),
    });
  }

  async updateVehicle(id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicle),
    });
  }

  async deleteVehicle(id: number): Promise<void> {
    return this.request<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Assignments API
  async getAssignments(): Promise<Assignment[]> {
    return this.request<Assignment[]>('/assignments');
  }

  async createAssignment(assignment: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assignment> {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async updateAssignment(id: number, assignment: Partial<Assignment>): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignment),
    });
  }

  async returnAssignment(id: number, returnDate: string, notes?: string): Promise<Assignment> {
    return this.request<Assignment>(`/assignments/${id}/return`, {
      method: 'PUT',
      body: JSON.stringify({ returnDate, notes }),
    });
  }

  // History API
  async getHistory(): Promise<HistoryRecord[]> {
    return this.request<HistoryRecord[]>('/history');
  }
}

export const apiService = new ApiService();