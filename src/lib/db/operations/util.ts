export const getPaginationOffset = (page: number, pageSize: number): number => {
  return (page - 1) * pageSize;
};

export const calculateTotalPages = (
  total: number,
  pageSize: number,
): number => {
  return Math.ceil(total / pageSize);
};
