import { BaseModel } from './BaseModel';

export interface City extends BaseModel {
  name: string;
  population: number;
  center: [number, number];
  boundary: number[];
}

export function createCity(_id = ''): City {
  return {
    _id,
    name: "",
    population: 0,
    center: [0, 0],
    boundary: []
  };
}