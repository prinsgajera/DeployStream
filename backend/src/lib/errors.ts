export class CodedError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "CodedError";
  }
}

const MONGO_DUPLICATE_KEY_CODE = 11000;

export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === MONGO_DUPLICATE_KEY_CODE;
}
