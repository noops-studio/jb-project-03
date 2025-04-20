// Global declarations for TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      useLocalImages: boolean;
    }
  }

  // Extend the global object to add useLocalImages flag
  var useLocalImages: boolean;
}

export {};