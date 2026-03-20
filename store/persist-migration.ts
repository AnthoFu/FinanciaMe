import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistStorage } from 'zustand/middleware';

/**
 * Creates a custom storage for Zustand persist that can handle data
 * migrated from a raw AsyncStorage format (e.g. raw arrays or simple values)
 * to the Zustand state structure.
 *
 * @param keyInState The key in the Zustand state where the raw value should be placed.
 * @returns A PersistStorage implementation.
 */
export function createMigratingStorage<T>(keyInState: keyof T): PersistStorage<T> {
  return {
    getItem: async (name) => {
      const value = await AsyncStorage.getItem(name);
      if (!value) return null;

      try {
        const parsed = JSON.parse(value);

        // If it's a Zustand state object, it will have a 'state' property.
        // If it doesn't, it's old data from the manual AsyncStorage usage.
        if (parsed === null || typeof parsed !== 'object' || !('state' in parsed)) {
          // Special case for Booleans or Strings that might be stored as "true", "dark", etc.
          // JSON.parse already handles "true" -> true, etc.
          return {
            state: { [keyInState]: parsed, isLoading: false } as unknown as T,
            version: 0,
          };
        }

        return parsed;
      } catch (e) {
        // If JSON.parse fails, it might be a raw string (like the old 'true' for onboarding)
        // that isn't valid JSON or just a simple string.
        let finalValue: any = value;
        if (value === 'true') finalValue = true;
        if (value === 'false') finalValue = false;

        return {
          state: { [keyInState]: finalValue, isLoading: false } as unknown as T,
          version: 0,
        };
      }
    },
    setItem: (name, value) => AsyncStorage.setItem(name, JSON.stringify(value)),
    removeItem: (name) => AsyncStorage.removeItem(name),
  };
}
