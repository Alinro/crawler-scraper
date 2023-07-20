export enum PageStatus {
  Pending = "pending",
  Processing = "processing",
  Done = "done",
}

export interface PageToVisitSchema {
  link: string;
  status?: PageStatus;
  discoveredAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
}
