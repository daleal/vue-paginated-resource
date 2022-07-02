export const keysOf = <ObjectType>(object: ObjectType) => (
  Object.keys(object) as Array<keyof ObjectType>
);
