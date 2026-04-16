export class RoutingError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "RoutingError";
    this.statusCode = statusCode;
  }
}
