import { createContext } from '@lit-labs/context';

import { RadianceStore } from './radiance-store';

export const radianceStoreContext = createContext<RadianceStore>(
  'hc_zome_radiance/store'
);
