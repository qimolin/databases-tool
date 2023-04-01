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
  if (gamma.size === 0) {
    changed = false;
  }
  return changed;
}

function intersection(setA: Set<string>, setB: Set<string>): Set<string> {
  const intersectionSet = new Set<string>();

  for (const elem of setB) {
    if (setA.has(elem)) {
      intersectionSet.add(elem);
    }
  }

  return intersectionSet;
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

function difference(setA: Set<string>, setB: Set<string>): Set<string> {
  const differenceSet = new Set<string>();

  for (const elem of setA) {
    if (!setB.has(elem)) {
      differenceSet.add(elem);
    }
  }

  return differenceSet;
}

function toString(set: Set<string>): string {
  return [...set].join("");
}

export { isSubset, union, intersection, isEqualSet, difference, toString };
