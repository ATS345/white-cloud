import { Injectable } from '@nestjs/common';

@Injectable()
export class CommunityService {
  findAll() {
    return { message: 'Community service is working' };
  }
}
