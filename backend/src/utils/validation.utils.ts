import { validate as uuidValidate } from 'uuid';

/**
 * Validates if a string is a valid UUID
 * @param id The string to validate
 * @returns boolean indicating if the string is a valid UUID
 */
export const isUUID = (id: string): boolean => {
  return uuidValidate(id);
};