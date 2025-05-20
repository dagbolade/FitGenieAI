// src/types/mongoose.d.ts
import mongoose from 'mongoose';

// Extend the mongoose module to ensure ObjectId types are compatible
declare module 'mongoose' {
  type ObjectId = mongoose.Types.ObjectId;

  // Add missing methods or properties to Schema.Types.ObjectId
  namespace Schema {
    namespace Types {
      // Make sure ObjectId has all the properties expected
      interface ObjectId extends mongoose.Types.ObjectId {
        // Add any missing properties here
        equals(val: any): boolean;
      }
    }
  }
}