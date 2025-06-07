// data key
export const SetIndex = (idx: number) => `$set[${idx}]` as const;
export const ArrayIndex = (idx: number) => `$arr[${idx}]` as const;
export const MapKeyIndex = (idx: number) => `$map[${idx},0]` as const;
export const MapValIndex = (idx: number) => `$map[${idx},1]` as const;
export const ObjectKeyIndex = (idx: number) => `$obj[${idx},0]` as const;
export const ObjectValIndex = (idx: number) => `$obj[${idx},1]` as const;
