export const getPaginationOffset = (page: number, pageSize: number): number =>
  (page - 1) * pageSize;

export const calculateTotalPages = (total: number, pageSize: number): number =>
  Math.ceil(total / pageSize);
