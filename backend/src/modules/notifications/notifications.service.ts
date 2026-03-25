import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  findAll() {
    return { message: 'Notifications service is working' };
  }
}
