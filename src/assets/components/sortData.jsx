export default function sortData(data, sorting) {
    if (!sorting.key) return data;
  
    return [...data].sort((a, b) => {
      if (a[sorting.key] < b[sorting.key]) return sorting.ascending ? -1 : 1;
      if (a[sorting.key] > b[sorting.key]) return sorting.ascending ? 1 : -1;
      return 0;
    });
  }