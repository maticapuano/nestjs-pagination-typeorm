import { FilterOperator } from "../enums/filter-operator.enum";

export interface SearchQuery {
  operator: FilterOperator;
  values: string[];
}
