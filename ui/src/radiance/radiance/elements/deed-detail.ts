import {
  hashProperty,
  sharedStyles,
  wrapPathInSvg,
} from "@holochain-open-dev/elements";
import "@holochain-open-dev/elements/elements/display-error.js";
import "@holochain-open-dev/file-storage/elements/show-image.js";
import { StoreSubscriber } from "@holochain-open-dev/stores";
import { EntryRecord } from "@holochain-open-dev/utils";
import { ActionHash, EntryHash, Record } from "@holochain/client";
import { consume } from "@lit-labs/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete, mdiPencil } from "@mdi/js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { radianceStoreContext } from "../context.js";
import { RadianceStore } from "../radiance-store.js";
import { Deed } from "../types.js";

/**
 * @element deed-detail
 * @fires deed-deleted: detail will contain { deedHash }
 */
@localized()
@customElement("deed-detail")
export class DeedDetail extends LitElement {
  // REQUIRED. The hash of the Deed to show
  @property(hashProperty("deed-hash"))
  deedHash!: ActionHash;

  /**
   * @internal
   */
  @consume({ context: radianceStoreContext, subscribe: true })
  radianceStore!: RadianceStore;

  /**
   * @internal
   */
  _deed = new StoreSubscriber(this, () =>
    this.radianceStore.deeds.get(this.deedHash)
  );

  renderDetail(entryRecord: EntryRecord<Deed>) {
    return html`
      <div style="display: flex; flex-direction: column">
        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg("Title")}:</strong></span
          >
          <span style="white-space: pre-line">${entryRecord.entry.title}</span>
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg("Description")}:</strong></span
          >
          <span style="white-space: pre-line"
            >${entryRecord.entry.description}</span
          >
        </div>

        <div style="display: flex; flex-direction: column; margin-bottom: 16px">
          <span style="margin-bottom: 8px"
            ><strong>${msg("Image Hash")}:</strong></span
          >
          <span style="white-space: pre-line"
            ><show-image
              .imageHash=${entryRecord.entry.image_hash}
              style="width: 300px; height: 200px"
            ></show-image
          ></span>
        </div>
      </div>
    `;
  }

  render() {
    switch (this._deed.value.status) {
      case "pending":
        return html`<sl-card>
          <div
            style="display: flex; flex: 1; align-items: center; justify-content: center"
          >
            <sl-spinner style="font-size: 2rem;"></sl-spinner>
          </div>
        </sl-card>`;
      case "complete":
        const deed = this._deed.value.value;

        if (!deed)
          return html`<span>${msg("The requested deed doesn't exist")}</span>`;

        return this.renderDetail(deed);
      case "error":
        return html`<sl-card>
          <display-error
            .headline=${msg("Error fetching the deed")}
            .error=${this._deed.value.error.data.data}
          ></display-error>
        </sl-card>`;
    }
  }

  static styles = [sharedStyles];
}
