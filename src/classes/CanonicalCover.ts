import { Closure } from "./Closure";
import { isSubset } from "@/utils/setFunctions";
import { renameKey } from "@/utils/mapFunctions";

export class CanonicalCover {
  private attributes: Set<string>;
  private fds: Map<string, Set<string>>;

  constructor(attributes: Set<string>, fds: Map<string, Set<string>>) {
    this.attributes = attributes;
    this.fds = fds;
    this.computeCover();
  }

  public getReadableCover(): string {
    let cover = "";
    for (const [key, value] of this.fds) {
      if (cover) {
        cover += ", ";
      }
      cover += `${key} → ${[...value].join("")}`;
    }
    return `F={${cover}}`;
  }

  private computeCover() {
    const closure = new Closure(this.attributes, this.fds);
    for (const [alfa, beta] of this.fds) {
      for (const A of alfa) {
        // Compute ({alfa} - A)⁺
        const { result } = closure.computeClosure(alfa.replace(A, ""));
        const isExtraneous = isSubset(beta, result);

        if (isExtraneous) {
          // Remove extraneous A
          renameKey(this.fds, alfa, A);
        }
      }
      for (const B of beta) {
        const tempFds = new Map(this.fds);
        tempFds.set(alfa, new Set([...beta].filter((x) => x !== B)));
        const tempClosure = new Closure(this.attributes, tempFds);
        const { result } = tempClosure.computeClosure(alfa);

        const isExtraneous = result.has(B);
        if (isExtraneous) {
          // Remove extraneous B
          this.fds.set(alfa, new Set([...beta].filter((x) => x !== B)));
        }
      }
    }
  }
}
