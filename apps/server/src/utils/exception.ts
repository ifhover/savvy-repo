import { Status } from "@repo/type";

export class BusinessError extends Error {
  status: Status;

  constructor(message: string, status: Status = Status.Business) {
    super(message);
    this.status = status;
  }
}
