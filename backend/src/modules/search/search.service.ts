import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  search(query: string) {
    return { query, results: [], message: 'Search service is working' };
  }
}
