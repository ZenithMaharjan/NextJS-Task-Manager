export interface Inventory {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: 'sport' | 'cruiser' | 'touring' | 'naked' | 'adventure' | 'scooter';
  engineCapacity: number;
  color: string;
  price: number;
  quantity: number;
  condition: 'new' | 'used';
  features: string[];
  inStock: boolean;
}
