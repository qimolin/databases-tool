export class Closure {
  private attributes: Set<string>;
  private attributeCombinations: Set<string>;
  private fds: Map<string, Set<string>>;
  private fullClosure: Map<string, Set<string>>;

  constructor(attributes: Set<string>, fds: Map<string, Set<string>>) {
    this.attributes = attributes;
    this.attributeCombinations = this.getAllCombinations(this.attributes);
    this.fds = fds;
    this.fullClosure = new Map();
    this.attributeCombinations.forEach((attribute) => {
      this.computeClosure(attribute);
    });
    this.computeFullClosure();
  }

  public getReadableClosure(alfa: string): string {
    const closure = this.fullClosure.get(alfa);
    if (closure) return `${alfa}⁺ → ${[...closure].join("")}`;
    return "Closure does not exist";
  }

  public getFullReadableClosure(): string[] {
    const closure: string[] = [];
    for (const [key, value] of this.fullClosure) {
      closure.push(`${key}⁺ → ${[...value].join("")}`);
    }
    return closure;
  }

  private computeClosure(alfa: string) {
    const result = new Set<string>(alfa); // alfa
    let changed = true;
    while (changed) {
      changed = false;
      for (const [beta, gamma] of this.fds.entries()) {
        if (this.isSubset(beta, result)) {
          changed = this.union(result, gamma) || changed;
        }
      }
    }
    return { alfa, result };
  }

  private computeFullClosure() {
    this.attributeCombinations.forEach((attribute) => {
      const { alfa, result } = this.computeClosure(attribute);
      this.fullClosure.set(alfa, result);
    });
  }

  private getAllCombinations(inputSet: Set<string>): Set<string> {
    const inputArray = [...inputSet];
    const n = inputArray.length;
    const result: Set<string> = new Set<string>();

    for (let i = 0; i < Math.pow(2, n); i++) {
      let combination = "";
      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          combination += inputArray[j];
        }
      }
      if (combination.length > 0) {
        result.add(combination);
      }
    }

    return result;
  }

  private isSubset(beta: string, result: Set<string>): boolean {
    for (const elem of beta) {
      if (!result.has(elem)) {
        return false;
      }
    }
    return true;
  }

  private union(result: Set<string>, gamma: Set<string>): boolean {
    let changed = false;
    for (const elem of gamma) {
      if (!result.has(elem)) {
        result.add(elem);
        changed = true;
      }
    }
    return changed;
  }
}
