import useSWR, { responseInterface as SWRResult } from 'swr';
import Papa from 'papaparse';

async function fetcher(url: string): Promise<any> {
  const response = await fetch(url);
  const text = await response.text();
  const { data, errors } = Papa.parse(text, { dynamicTyping: true, skipEmptyLines: true, header: true });
  if (errors.length > 0) {
    throw errors;
  }
  return data;
}

export default function useCSV<Data, Error = any>(url: string): SWRResult<Data, Error> {
  return useSWR<Data, Error>(url, fetcher);
}
