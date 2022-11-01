# nestjs-pagination-typeorm

Paginate and sort helpers for TypeORM and NestJS.

- Filter operators (eq, like, ne, gt, gte, in, lt, lte, btw)
- Sort by multiple columns
- Paginate with cursor or offset
- Order results by multiple columns
- Extends typeorm added Unit of work pattern (transactional queries)

### Documentation in progress

## Installation

```bash
$ npm install --save nestjs-pagination-typeorm
```

## Usage

### Create Repository

```typescript
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BaseRepository } from "nestjs-pagination-typeorm";

export class UserRepository extends BaseRepository<User> {
  public constructor(@InjectRepository(User) repository: Repository<User>) {
    super(User);
  }
}
```

### Create Service

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  public async findAll(filter: PaginationFilter<User>): Promise<PaginationResult<User>> {
    return this.userRepository.paginate(filter);
  }
}
```

### Create Controller

```typescript
import { Controller, Get, Query } from "@nestjs/common";
import { Paginate, PaginationDto } from "nestjs-pagination-typeorm";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Get()
  public async findAll(@Paginate() filter: PaginationFilter<User>): Promise<PaginationDto<User>> {
    return this.userService.findAll(filter);
  }
}
```
