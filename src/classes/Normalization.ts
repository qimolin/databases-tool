import { isSubset } from "@/utils/setFunctions";
import { Closure } from "./Closure";

export class Normalization {
  public static checkBCNF(
    attributes: Set<string>,
    fds: Map<string, Set<string>>
  ): boolean {
    const closure = new Closure(attributes, fds);
    for (const [alfa, beta] of fds) {
      // Check if the FD is trivial (i.e., beta is a subset of alfa) or alfa is a superkey
      if (!isSubset(beta, new Set(alfa)) && !closure.isSuperKey(alfa)) {
        return false;
      }
    }
    return true;
  }

  public static check3NF(
    attributes: Set<string>,
    fds: Map<string, Set<string>>
  ): boolean {
    const closure = new Closure(attributes, fds);
    const candidateKeys = closure.getAllCandidateKeys();

    for (const [alfa, beta] of fds) {
      const attributeContained = (): boolean => {
        const betaMinusAlfa = new Set(
          [...beta].filter((x) => !alfa.includes(x))
        );

        for (const attribute of betaMinusAlfa) {
          let foundInCandidateKey = false;

          for (const candidateKey of candidateKeys) {
            if (candidateKey.has(attribute)) {
              foundInCandidateKey = true;
              break;
            }
          }

          if (!foundInCandidateKey) {
            return false;
          }
        }

        return true;
      };

      // Check if the FD is trivial (i.e., beta is a subset of alfa) or alfa is a superkey or each attribute in beta - alfa is contained in a candidate key
      if (
        !isSubset(beta, new Set(alfa)) &&
        !closure.isSuperKey(alfa) &&
        !attributeContained()
      ) {
        return false;
      }
    }
    return true;
  }
}
