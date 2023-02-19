import { intersection, isSubset, union } from "@/utils/setFunctions";
import { Closure } from "./Closure";

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

  private isLossless() {
    let isLossless = false;
    const closure = new Closure(this.attributes, this.fds);
    for (let i = 0; i < this.relations.length; i++) {
      const firstRelation = this.relations[i];
      for (let j = i + 1; j < this.relations.length; j++) {
        const secondRelation = this.relations[j];
        const relationIntersection = intersection(
          firstRelation.attributes,
          secondRelation.attributes
        );
        const intersectionClosure = closure.computeClosure(
          relationIntersection.toString()
        );
        if (
          isSubset(firstRelation.attributes, intersectionClosure.result) ||
          isSubset(secondRelation.attributes, intersectionClosure.result)
        ) {
          isLossless = true;
        }
      }
    }
    return isLossless;
  }

  private isDependencyPreserving() {
    let isDependencyPreserving = false;

    const closure = new Closure(this.attributes, this.fds);
    for (let i = 0; i < this.relations.length; i++) {
      let changed = true;
      while (changed) {
        changed = false;
        const relation = this.relations[i].attributes;
        for (const [alfa, beta] of this.fds) {
          const temp = closure.computeClosure(
            intersection(new Set(alfa), relation).toString()
          );
          const t = intersection(temp.result, relation);
          changed = union(relation, t) || changed;
          if (isSubset(new Set(beta), relation)) {
            isDependencyPreserving = true;
          } else {
            isDependencyPreserving = false;
          }
        }
      }
    }
    return isDependencyPreserving;
  }
}
