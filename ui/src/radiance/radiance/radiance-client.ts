import {
  EntryRecord,
  ZomeClient,
  isSignalFromCellWithRole,
} from '@holochain-open-dev/utils';
import {
  ActionHash,
  AgentPubKey,
  AppAgentClient,
  EntryHash,
  Record,
} from '@holochain/client';

import { Deed } from './types';
import { RadianceSignal } from './types.js';

export class RadianceClient extends ZomeClient<RadianceSignal> {
  constructor(
    public client: AppAgentClient,
    public roleName: string,
    public zomeName = 'radiance'
  ) {
    super(client, roleName, zomeName);
  }
  /** Deed */

  async createDeed(deed: Deed): Promise<EntryRecord<Deed>> {
    const record: Record = await this.callZome('create_deed', deed);
    return new EntryRecord(record);
  }

  async getDeed(deedHash: ActionHash): Promise<EntryRecord<Deed> | undefined> {
    const record: Record = await this.callZome('get_deed', deedHash);
    return record ? new EntryRecord(record) : undefined;
  }

  /** All Deeds */

  async getAllDeeds(): Promise<Array<EntryRecord<Deed>>> {
    const records: Record[] = await this.callZome('get_all_deeds', null);
    return records.map(r => new EntryRecord(r));
  }

}
