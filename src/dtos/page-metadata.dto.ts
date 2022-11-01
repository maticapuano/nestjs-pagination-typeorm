export class PageMetadataDto {
  public page: number;

  public limit: number;

  public totalItems: number;

  public totalPages: number;

  public hasNextPage: boolean;

  public hasPreviousPage: boolean;

  public constructor({ page, limit, totalItems, totalPages }: PageMetadataDto) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = totalPages;
    this.hasNextPage = page < totalPages;
    this.hasPreviousPage = page > 1;
  }
}
