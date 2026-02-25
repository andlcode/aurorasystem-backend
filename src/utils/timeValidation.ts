const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

export function isValidTimeFormat(value: string): boolean {
  return TIME_REGEX.test(value);
}

export function validateClassTimes(startTime: string, endTime?: string | null): void {
  if (!isValidTimeFormat(startTime)) {
    throw new Error("startTime deve estar no formato HH:mm");
  }
  if (endTime != null && endTime !== "" && !isValidTimeFormat(endTime)) {
    throw new Error("endTime deve estar no formato HH:mm");
  }
}
