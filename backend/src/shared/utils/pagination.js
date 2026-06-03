export const getPagination = (
  page,
  limit
) => {
  const currentPage =
    Number(page) || 1;

  const pageSize =
    Number(limit) || 10;

  const skip =
    (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    skip,
  };
};