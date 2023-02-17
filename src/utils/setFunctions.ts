function isSubset(lhs: Set<string>, rhs: Set<string>): boolean {
  for (const elem of lhs) {
    if (!rhs.has(elem)) {
      return false;
    }
  }
  return true;
}

function union(result: Set<string>, gamma: Set<string>): boolean {
  let changed = false;
  for (const elem of gamma) {
    if (!result.has(elem)) {
      result.add(elem);
      changed = true;
    }
  }
  return changed;
}

function isEqualSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}

export { isSubset, union, isEqualSet };
