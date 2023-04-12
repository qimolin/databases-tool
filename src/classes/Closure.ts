import { isSubset, union, isEqualSet } from "@/utils/setFunctions";
export class Closure {
  private attributes: Set<string>;
  private permutations: Set<string>;
  private fds: Map<string, Set<string>>;
  private fullClosure: Map<string, Set<string>>;

  constructor(attributes: Set<string>, fds: Map<string, Set<string>>) {
    this.attributes = attributes;
    this.permutations = this.getPermutations(this.attributes);
    this.fds = fds;
    this.fullClosure = new Map();
    this.permutations.forEach((permutation) => {
      this.computeClosure(permutation);
    });
    this.computeFullClosure();
  }

  public isSuperKey(input: string): boolean {
    const closure = this.computeClosure(input);
    return isEqualSet(closure.result, this.attributes);
  }

  public getAllCandidateKeys(): Set<Set<string>> {
    const candidateKeys: Set<Set<string>> = new Set();

    for (const alfa of this.permutations) {
      if (this.isSuperKey(alfa)) {
        const candidateKey = new Set(alfa);
        let isMinimal = true;

        for (const existingKey of candidateKeys) {
          if (isSubset(candidateKey, existingKey)) {
            isMinimal = false;
            break;
          }
        }

        if (isMinimal) {
          candidateKeys.add(candidateKey);
        }
      }
    }

    return candidateKeys;
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
    const result = new Set(alfa);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [beta, gamma] of this.fds) {
        if (isSubset(new Set(beta), result)) {
          changed = union(result, gamma) || changed;
        }
      }
    }
    return { alfa, result };
  }

  public computeFullClosure() {
    this.permutations.forEach((permutation) => {
      const { alfa, result } = this.computeClosure(permutation);
      this.fullClosure.set(alfa, result);
    });
  }

  private getPermutations(inputSet: Set<string>): Set<string> {
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
