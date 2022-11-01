import { PageMetadataDto } from "./page-metadata.dto";

export class Pagination<T> {
  public data: T[];

  public metadata: PageMetadataDto;

  public constructor(data: T[], metadata: PageMetadataDto) {
    this.data = data;
    this.metadata = metadata;
  }
}
