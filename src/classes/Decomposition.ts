import {
  intersection,
  isSubset,
  union,
  toString,
  difference,
} from "@/utils/setFunctions";
import { Closure } from "./Closure";
import { Graph } from "./Graph";
import { Normalization } from "./Normalization";

type Relation = {
  attributes: Set<string>;
};

export class Decomposition {
  private attributes: Set<string>;
  private fds: Map<string, Set<string>>;
  private relations: Relation[];

  constructor(
    attributes: Set<string>,
    fds: Map<string, Set<string>>,
    relations: string[]
  ) {
    this.attributes = attributes;
    this.fds = fds;
    this.relations = this.computeRelations(relations);
  }

  private computeRelations(relations: string[]): Relation[] {
    const newRelations: Relation[] = [];
    for (const relation of relations) {
      const newRelation: Relation = {
        attributes: new Set(
          relation
            .replace(/\s/g, "")
            .replace(/R\d+=\(/, "")
            .replace(")", "")
            .split(",")
        ),
      };
      newRelations.push(newRelation);
    }
    return newRelations;
  }

  public isLossless(): boolean {
    const closure = new Closure(this.attributes, this.fds);
    const graph = new Graph(this.relations.length);
    for (let i = 0; i < this.relations.length; i++) {
      const firstRelation = this.relations[i];
      for (let j = i + 1; j < this.relations.length; j++) {
        const secondRelation = this.relations[j];
        const relationIntersection = intersection(
          firstRelation.attributes,
          secondRelation.attributes
        );
        const intersectionClosure = closure.computeClosure(
          toString(relationIntersection)
        );
        if (
          isSubset(firstRelation.attributes, intersectionClosure.result) ||
          isSubset(secondRelation.attributes, intersectionClosure.result)
        ) {
          graph.addEdge(i, j);
        }
      }
    }
    return graph.isConnected();
  }

  public isDependencyPreserving(): boolean {
    const isDependencyPreserving: boolean[] = [];
    const closure = new Closure(this.attributes, this.fds);
    let counter = 0;
    for (const [alfa, beta] of this.fds) {
      const result = new Set(alfa);
      let changed = true;
      while (changed) {
        changed = false;
        const rDependencyPreserving: boolean[] = [];
        for (let i = 0; i < this.relations.length; i++) {
          const rClosure = closure.computeClosure(
            toString(
              intersection(
                new Set(result),
                new Set(this.relations[i].attributes)
              )
            )
          );
          const t = intersection(rClosure.result, this.relations[i].attributes);
          if (t.size > 0) {
            changed = union(result, t) || changed;
          }
          if (isSubset(new Set(beta), result)) {
            rDependencyPreserving[i] = true;
          } else {
            rDependencyPreserving[i] = false;
          }
        }
        isDependencyPreserving[counter] = rDependencyPreserving.every(
          (value) => value === true
        );
      }
      counter++;
    }
    return isDependencyPreserving.every((value) => value === true);
  }

  public isIn3NF(): boolean {
    for (const relation of this.relations) {
      const applicableFds = this.getApplicableFds(relation.attributes);
      if (!Normalization.check3NF(relation.attributes, applicableFds)) {
        return false;
      }
    }
    return true;
  }

  public isInBCNF(): boolean {
    for (const relation of this.relations) {
      const applicableFds = this.getApplicableFds(relation.attributes);
      if (!Normalization.checkBCNF(relation.attributes, applicableFds)) {
        return false;
      }
    }
    return true;
  }

  private getApplicableFds(
    relationAttributes: Set<string>
  ): Map<string, Set<string>> {
    const applicableFds = new Map<string, Set<string>>();
    for (const [alfa, beta] of this.fds) {
      if (
        isSubset(new Set(alfa), relationAttributes) &&
        isSubset(beta, relationAttributes)
      ) {
        applicableFds.set(alfa, beta);
      }
    }
    return applicableFds;
  }
}
