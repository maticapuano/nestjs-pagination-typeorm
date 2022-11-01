import { ExecutionContext } from "@nestjs/common";
import { createParamDecorator } from "@nestjs/common";
import { PaginationParser } from "../utils/pagination-parser.util";

export const Paginate = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const { query } = ctx.switchToHttp().getRequest();

  return PaginationParser.parse(query);
});
