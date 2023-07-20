import { Material } from './material';

export interface Lesson {
  id: number;
  userId: string;
  materialId: number;
  createdAt: string;
  updatedAt: string;
  material: Material;
}