import { isSubset, union, isEqualSet } from "@/utils/setFunctions";
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

  public isSuperKey(input: string): boolean {
    const closure = this.computeClosure(input);
    return isEqualSet(closure.result, this.attributes);
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

  public getFullClosure(): Map<string, Set<string>> {
    return this.fullClosure;
  }

  public computeClosure(alfa: string) {
    const result = new Set<string>(alfa);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [beta, gamma] of this.fds.entries()) {
        if (isSubset(new Set(beta), result)) {
          changed = union(result, gamma) || changed;
        }
      }
    }
    return { alfa, result };
  }

  public computeFullClosure() {
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
}
