// Backend/src/types/express/index.d.ts

// DO NOT include any top-level import or export statements except the “export {}” (see note below)

declare global {
    namespace Express {
      interface Request {
        user?: {
          id: number;
          role: string;
          firstName: string;
          lastName: string;
        };
      }
    }
  }
  
  // The following line tells TypeScript this file is a module,
  // but does not prevent global augmentation.
  export {};
  