function renameKey(map: Map<any, any>, oldKey: any, newKey: any): void {
  if (!map.has(oldKey)) {
    return;
  }

  const value = map.get(oldKey);
  if (map.has(newKey)) {
    map.get(oldKey)?.add(newKey);
    return;
  }
  map.set(newKey, value);
  map.delete(oldKey);
}

export { renameKey };
