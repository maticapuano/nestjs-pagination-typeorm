import {
  Between,
  DeepPartial,
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  In,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { PageMetadataDto } from "../dtos/page-metadata.dto";
import { Pagination } from "../dtos/pagination.dto";
import { FilterOperator } from "../enums/filter-operator.enum";
import { PaginationFilter } from "../interfaces/pagination-filter.interface";
import { SearchQuery } from "../interfaces/search-query.interface";

/**
 * Base repository class that contains common methods for all repositories.
 * All repositories should extend this class.
 */
export abstract class BaseRepository<T extends ObjectLiteral> {
  public constructor(protected repository: Repository<T>) {}

  public async findAll(options?: PaginationFilter<T>): Promise<T[]> {
    return this.repository.find(this.buildSearchQuery(options));
  }

  public async paginate(options?: PaginationFilter<T>): Promise<Pagination<T>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;

    const [data, totalItems] = await this.repository.findAndCount(
      this.buildSearchQuery({ ...options, page, limit }),
    );

    const totalPages = Math.ceil(totalItems / limit);

    const metadata = new PageMetadataDto({
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });

    return new Pagination(data, metadata);
  }

  public async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  public async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  public async bulkCreate(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);

    return this.repository.save(entities);
  }

  public async save(entity: T): Promise<T> {
    return this.repository.save(entity);
  }

  public async delete(id: number | string): Promise<void> {
    await this.repository.delete(id);
  }

  public async softDelete(id: number | string): Promise<void> {
    await this.repository.softDelete(id);
  }

  public async restore(id: number | string): Promise<void> {
    await this.repository.restore(id);
  }

  public setEntityManager(entityManager: EntityManager): void {
    this.repository = entityManager.getRepository(this.repository.metadata.target);
  }

  private buildSearchQuery(options?: PaginationFilter<T>): FindOneOptions<T> {
    const columnsFields = options?.fields ?? [];
    const fields = this.repository.metadata.columns
      .filter(column => columnsFields.includes(column.propertyName))
      .map(column => column.propertyName);

    return {
      ...options,
      ...(options?.limit && {
        take: options.limit,
      }),
      ...(options?.page &&
        options.limit && {
          skip: (options.page - 1) * (options.limit || 10),
        }),
      ...(options?.fields && {
        select: fields,
      }),
      ...(options?.search && {
        where: this.buildConditionals(options.search),
      }),
    };
  }

  private buildConditionals(search: Record<string, SearchQuery[]>): FindOptionsWhere<T> {
    return Object.keys(search).reduce((conditionals, key) => {
      if (!this.repository.metadata.columns.some(column => column.propertyName === key)) {
        return conditionals;
      }

      return search[key].map(query => {
        const { operator, values } = query;
        const [value] = values;

        if (operator === FilterOperator.EQUAL) {
          return [conditionals, { [key]: value }];
        }

        if (operator === FilterOperator.LIKE) {
          return [conditionals, { [key]: Like(`%${value}%`) }];
        }

        if (operator === FilterOperator.NOT_EQUAL) {
          return [conditionals, { [key]: Not(value) }];
        }

        if (operator === FilterOperator.GREATER_THAN) {
          return [conditionals, { [key]: MoreThan(value) }];
        }

        if (operator === FilterOperator.GREATER_THAN_OR_EQUAL) {
          return [conditionals, { [key]: MoreThanOrEqual(value) }];
        }

        if (operator === FilterOperator.IN) {
          return [conditionals, { [key]: In(values) }];
        }

        if (operator === FilterOperator.LESS_THAN) {
          return [conditionals, { [key]: LessThan(value) }];
        }

        if (operator === FilterOperator.LESS_THAN_OR_EQUAL) {
          return [conditionals, { [key]: LessThanOrEqual(value) }];
        }

        if (operator === FilterOperator.BETWEEN && values.length === 2) {
          return [conditionals, { [key]: Between(values[0], values[1]) }];
        }

        return conditionals;
      });
    }, {});
  }
}
