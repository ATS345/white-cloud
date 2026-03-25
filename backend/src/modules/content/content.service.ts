import { Injectable } from "@nestjs/common";

@Injectable()
export class ContentService {
  findAll() {
    return { message: "Content service is working" };
  }
}
