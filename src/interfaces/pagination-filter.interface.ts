import { FindOneOptions } from "typeorm";
import { SearchQuery } from "./search-query.interface";

export interface PaginationFilter<T> extends FindOneOptions<T> {
  page?: number;
  limit?: number;
  fields?: Array<keyof T>;
  search?: Record<string, SearchQuery[]>;
}
