export const wait = function (ms) {
  return new Promise((res) => setTimeout(res, ms));
};
