import { BadRequestException } from "@nestjs/common";
import { FilterOperator } from "../enums/filter-operator.enum";
import { OrderDirection } from "../enums/order-direction.enum";
import { PaginationQuery } from "../interfaces/pagination-query.interface";
import { SearchQuery } from "../interfaces/search-query.interface";

export class PaginationParser {
  public static parse<T>(query: Record<string, string>): PaginationQuery<T> {
    return {
      page: this.parsePage(query),
      limit: this.parseLimit(query),
      fields: this.parseFields<T>(query),
      order: this.parseOrder(query),
      search: this.parseSearch(query),
    };
  }

  private static parsePage(query: Record<string, string>): number {
    const numberRegex = /^\d+$/;

    if (query.page && !numberRegex.test(query.page)) {
      throw new BadRequestException("Sorry, page must be a number");
    }

    const page = parseInt(query.page, 10) || 1;

    if (isNaN(page) || page < 1) {
      throw new BadRequestException("Sorry, but the page must be a number greater than 0.");
    }

    return page;
  }

  private static parseLimit(query: Record<string, string>): number {
    const numberRegex = /^\d+$/;

    if (query.limit && !numberRegex.test(query.limit)) {
      throw new BadRequestException("Sorry, limit must be a number");
    }

    const limit = parseInt(query.limit, 10) || 10;

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException("Sorry, but the limit must be a number greater than 0.");
    }

    if (limit > 50) {
      throw new BadRequestException("Sorry, but the limit must be a number less than 50.");
    }

    return limit;
  }

  private static parseFields<T>(query: Record<string, string>): Array<keyof T> {
    if (!query.fields) {
      return [];
    }

    return query.fields.split(",") as Array<keyof T>;
  }

  private static parseOrder(query: Record<string, string>): Record<string, OrderDirection> {
    if (!query.order) {
      return {};
    }

    return query.order.split(",").reduce((acc, order) => {
      const [field, direction] = order.split(":");

      if (direction !== OrderDirection.ASC && direction !== OrderDirection.DESC) {
        throw new BadRequestException("Sorry, but the order must be ASC or DESC.");
      }

      return {
        ...acc,
        [field]: direction,
      };
    }, {});
  }

  private static parseSearch(query: Record<string, string>): Record<string, SearchQuery[]> {
    const ignoreKeys = ["page", "limit", "fields", "order"];
    const querySearch = Object.entries(query).filter(([key]) => !ignoreKeys.includes(key));
    const filterOperatorsAllowed = Object.values(FilterOperator);

    return querySearch.reduce((acc, [key, entires]) => {
      const search: SearchQuery[] = [];

      Object.entries(entires).flatMap(([operator, value]) => {
        if (!filterOperatorsAllowed.includes(operator as FilterOperator)) {
          throw new BadRequestException(
            `Please, use next operators: ${filterOperatorsAllowed.join(", ")} for search`,
          );
        }

        if (operator === FilterOperator.EQUAL) {
          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.LIKE) {
          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.NOT_EQUAL) {
          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.GREATER_THAN) {
          if (!this.isNumber(value)) {
            throw new BadRequestException(`Sorry the operator ${operator} only accepts numbers`);
          }

          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.GREATER_THAN_OR_EQUAL) {
          if (!this.isNumber(value)) {
            throw new BadRequestException(`Sorry the operator ${operator} only accepts numbers`);
          }

          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.IN) {
          search.push({ operator, values: value.split(",") });
        }

        if (operator === FilterOperator.LESS_THAN) {
          if (!this.isNumber(value)) {
            throw new BadRequestException(`Sorry the operator ${operator} only accepts numbers`);
          }

          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.LESS_THAN_OR_EQUAL) {
          if (!this.isNumber(value)) {
            throw new BadRequestException(`Sorry the operator ${operator} only accepts numbers`);
          }

          search.push({ operator, values: [value] });
        }

        if (operator === FilterOperator.BETWEEN) {
          if (!this.isNumber(value)) {
            throw new BadRequestException(`Sorry the operator ${operator} only accepts numbers`);
          }

          search.push({ operator, values: value.split(",") });
        }
      });

      return {
        ...acc,
        [key]: search,
      };
    }, {});
  }

  private static isNumber(value: string): boolean {
    const regex = /^\d+$/;

    return regex.test(value) && !isNaN(parseInt(value, 10));
  }
}
