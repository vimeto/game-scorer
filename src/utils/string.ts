
const truncateStringToLength = (str: string, length = 10) => {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

export {
  truncateStringToLength,
}
