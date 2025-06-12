export interface Market {
  id: number;
  password: string;
  delivery_price: number;
  phone: string;
  name: string;
  thumbnail_url: string;
  name_ru: string;
  location: string;
  location_ru: string;
  isVIP: boolean;
}

export interface Category {
  id: number;
  name: string;
  thumbnail_url: string;
  name_ru: string;
}

export interface Banner {
  id: number;
  description: string;
  thumbnail_url: string;
}

export interface UserMessage {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  message: string;
}

export interface MarketMessage {
  id: number;
  market_id: number;
  full_name: string;
  phone: string;
  message: string;
}

export interface User {
  id: number;
  full_name: string;
  phone: string;
  verified: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}