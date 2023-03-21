import { LitElement, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import { ActionHash } from "@holochain/client";
import { StoreSubscriber } from "@holochain-open-dev/stores";
import { consume } from "@lit-labs/context";
import { localized, msg } from "@lit/localize";
import { sharedStyles } from "@holochain-open-dev/elements";

import "@holochain-open-dev/elements/elements/display-error.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";

import "./deed-summary.js";
import "./create-deed.js";
import "./deed-detail.js";
import { RadianceStore } from "../radiance-store.js";
import { radianceStoreContext } from "../context.js";
import { Deed } from "../types.js";
import { EntryRecord } from "@holochain-open-dev/utils";

/**
 * @element all-deeds
 */
@localized()
@customElement("all-deeds")
export class AllDeeds extends LitElement {
  /**
   * @internal
   */
  @consume({ context: radianceStoreContext, subscribe: true })
  radianceStore!: RadianceStore;

  /**
   * @internal
   */
  _allDeeds = new StoreSubscriber(this, () => this.radianceStore.allDeeds);

  @state()
  _deedPosition: [number, number] | undefined = undefined;

  @state()
  _selectedDeed: ActionHash | undefined = undefined;

  renderList(deeds: Array<EntryRecord<Deed>>) {
    return html`
      ${this._deedPosition
        ? html`
            <sl-dialog
              .label=${msg("Create Deed")}
              open
              @sl-hide=${() => {
                this._deedPosition = undefined;
              }}
              ><create-deed
                .x=${this._deedPosition[0]}
                .y=${this._deedPosition[1]}
                @deed-created=${() => {
                  this._deedPosition = undefined;
                }}
              ></create-deed
            ></sl-dialog>
          `
        : html``}
      ${this._selectedDeed
        ? html`
            <sl-dialog
              .label=${msg("Deed")}
              open
              @sl-hide=${() => {
                this._selectedDeed = undefined;
              }}
              ><deed-detail .deedHash=${this._selectedDeed}></deed-detail
            ></sl-dialog>
          `
        : html``}
      <div
        @click=${(e: any) => {
          const rect = e.target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          this._deedPosition = [x, y];
        }}
        @keydown=${() => {}}
        style="flex: 1; position:relative;"
      >
        <img
          alt=""
          src="../../../../assets/image.jpeg"
          style="position: absolute; top: 0; left: 0;"
        />

        ${deeds.map(
          (deed) =>
            html`<span
              @click=${(e: Event) => {
                e.stopPropagation();
                this._selectedDeed = deed.actionHash;
              }}
              @keydown=${() => {}}
              style="position: absolute; height: 20px; width: 20px; z-index: 10; border-radius: 50%; border: 1px solid; background: yellow; top: ${deed
                .entry.y}px; left: ${deed.entry.x}px "
            ></span>`
        )}
      </div>
    `;
  }

  render() {
    switch (this._allDeeds.value.status) {
      case "pending":
        return html`<div
          style="display: flex; flex: 1; align-items: center; justify-content: center"
        >
          <sl-spinner style="font-size: 2rem;"></sl-spinner>
        </div>`;
      case "complete":
        return this.renderList(this._allDeeds.value.value);
      case "error":
        return html`<display-error
          .headline=${msg("Error fetching the deeds")}
          .error=${this._allDeeds.value.error.data.data}
        ></display-error>`;
    }
  }

  static styles = [sharedStyles];
}
