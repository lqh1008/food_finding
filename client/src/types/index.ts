import type { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface FoodEntry {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  rating: number;
  location?: string;
  date: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
