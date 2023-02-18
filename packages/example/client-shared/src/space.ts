export class Space {
  constructor(private readonly fetchHost: string) {}

  public async exists(spaceID: string): Promise<boolean> {
    const spaceExistRes = await this.fetchJSON("spaceExists", spaceID);
    if (
      spaceExistRes &&
      typeof spaceExistRes === "object" &&
      typeof spaceExistRes.spaceExists === "boolean"
    ) {
      return spaceExistRes.spaceExists;
    }
    throw new Error("Bad response from spaceExists");
  }

  public async create(spaceID?: string): Promise<string> {
    const createSpaceRes = await this.fetchJSON("createSpace", spaceID);
    if (
      createSpaceRes &&
      typeof createSpaceRes === "object" &&
      typeof createSpaceRes.spaceID === "string"
    ) {
      return createSpaceRes.spaceID;
    }
    throw new Error("Bad response from createSpace");
  }

  private async fetchJSON(apiName: string, spaceID: string | undefined) {
    const res = await fetch(`${this.fetchHost}/api/replicache/${apiName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:
        spaceID &&
        JSON.stringify({
          spaceID,
        }),
    });
    return await res.json();
  }
}
