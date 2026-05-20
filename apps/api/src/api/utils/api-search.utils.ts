import type { WebSource } from '@perpx/shared/types/message.type';
import type { TavilyResultItem } from '../api.types';

export function parseTavilyResults(rawResults: unknown): WebSource[] {
  let parsedResults: unknown = rawResults;

  if (typeof rawResults === 'string') {
    try {
      parsedResults = JSON.parse(rawResults) as unknown;
    } catch {
      parsedResults = [];
    }
  }

  let resultsArray: TavilyResultItem[] = [];

  if (Array.isArray(parsedResults)) {
    resultsArray = parsedResults as TavilyResultItem[];
  } else if (
    parsedResults !== null &&
    typeof parsedResults === 'object' &&
    'results' in parsedResults
  ) {
    const obj = parsedResults as { results: unknown };
    if (Array.isArray(obj.results)) {
      resultsArray = obj.results as TavilyResultItem[];
    }
  }

  return resultsArray.map((item) => ({
    title: typeof item.title === 'string' ? item.title : 'Untitled',
    url: typeof item.url === 'string' ? item.url : '',
    snippet:
      typeof item.content === 'string'
        ? item.content
        : typeof item.snippet === 'string'
          ? item.snippet
          : '',
  }));
}

export function buildWebContext(sources: WebSource[]): string {
  return sources
    .map(
      (source, index) =>
        `Source ${index + 1}:\nTitle: ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}`,
    )
    .join('\n\n');
}
