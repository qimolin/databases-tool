export class Dependency {
  private attributes: Set<string>;
  private fds: Map<string, Set<string>>;
  constructor(attributes: string, fds: string) {
    this.fds = new Map();
    this.attributes = new Set();
    fds
      .replace(/\s/g, "")
      .replace("F={", "")
      .replace("}", "")
      .split(",")
      .forEach((fd) => {
        const [lhs, rhs] = fd.split("→");
        this.fds.set(lhs, new Set(rhs));
      });
    attributes
      .replace(/\s/g, "")
      .replace("R=(", "")
      .replace(")", "")
      .split(",")
      .forEach((attr) => {
        this.attributes.add(attr);
      });
  }

  public getFD() {
    return this.fds;
  }

  public getAttributes() {
    return this.attributes;
  }
}
