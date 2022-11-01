import { OrderDirection } from "../enums/order-direction.enum";
import { SearchQuery } from "./search-query.interface";

export interface PaginationQuery<T> {
  page?: number;
  limit?: number;
  fields?: Array<keyof T>;
  order?: Record<string, OrderDirection>;
  search?: Record<string, SearchQuery[]>;
}
