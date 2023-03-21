import { AsyncReadable, lazyLoadAndPoll } from "@holochain-open-dev/stores";
import { EntryRecord, LazyHoloHashMap } from "@holochain-open-dev/utils";
import { ActionHash } from "@holochain/client";

import { RadianceClient } from "./radiance-client.js";

export class RadianceStore {
  constructor(public client: RadianceClient) {}

  /** Deed */

  deeds = new LazyHoloHashMap((deedHash: ActionHash) =>
    lazyLoadAndPoll(async () => this.client.getDeed(deedHash), 4000)
  );

  /** All Deeds */

  allDeeds = lazyLoadAndPoll(async () => this.client.getAllDeeds(), 4000);
}
