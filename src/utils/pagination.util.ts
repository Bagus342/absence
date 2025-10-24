import { PaginationMeta } from 'src/common/interfaces/pagination.interface';

export const buildPagination = (
  page: number,
  take: number,
  total: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / take);
  return {
    current_page: page,
    per_page: take,
    total: total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};
