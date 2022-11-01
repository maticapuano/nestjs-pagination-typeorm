import { InjectDataSource } from "@nestjs/typeorm";
import { BaseRepository } from "../repositories/base-repository";
import { DataSource, ObjectLiteral } from "typeorm";
import { Callback } from "../types/callback.type";

export class UnitOfWorkManger {
  private repositories: BaseRepository<ObjectLiteral>[] = [];

  public constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Run the given function in a transaction. If the function throws an error, the transaction will be rolled back.
   */
  public async runInTransaction<T>(callback: Callback<T>): Promise<T> {
    const manager = await this.dataSource.createEntityManager();

    return manager.transaction(async entityManager => {
      try {
        this.repositories.forEach(repository => repository.setEntityManager(entityManager));

        return await callback();
      } catch (error) {
        throw error;
      }
    });
  }

  /**
   * Add a repository to the unit of work. This will allow the unit of work to manage the repository.
   */
  public addRepository(repository: BaseRepository<ObjectLiteral>): void {
    this.repositories.push(repository);
  }
}
