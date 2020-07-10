import useSWR from 'swr';
import Papa from 'papaparse';

async function fetcher(url) {
  const response = await fetch(url);
  const text = await response.text();
  const { data, errors } = Papa.parse(text, { dynamicTyping: true, skipEmptyLines: true, header: true });
  if (errors.length > 0) {
    throw errors;
  }
  return data;
}

export default function useCSV(url) {
  return useSWR(url, fetcher);
}
