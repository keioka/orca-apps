export interface Publisher {
  id: number;
  name: string;
  type: string;
  url: string;
  externalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: number;
  name: string;
  type: string;
  category: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  publisherId: number;
  publisher: Publisher;
}
