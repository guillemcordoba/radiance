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
import { RadianceConfig, RadianceStore } from "../radiance-store.js";
import { radianceStoreContext } from "../context.js";
import { Deed } from "../types.js";
import { EntryRecord } from "@holochain-open-dev/utils";

const MAX_GLOW_SIZE = 100;

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

  // First returns 0, then 1, 2, 3, (4 means not visible)
  getDeedGlowStage(deedTimestamp: number, now: number): number {
    const millisPassedSinceDeed = now - deedTimestamp;
    const deedExpiryMillis =
      deedTimestamp +
      this.radianceStore.config.deedDurabilityDays * 24 * 60 * 60 * 1000;

    const expiryPercentage =
      millisPassedSinceDeed / (deedExpiryMillis - deedTimestamp);

    return Math.floor(3 * expiryPercentage);
  }

  computeBoxShadow(deedTimestamp: number): string {
    const stage = this.getDeedGlowStage(deedTimestamp, Date.now());

    switch (stage) {
      case 0:
        return `box-shadow: 0 0 0px 30px rgba(255, 230, 0, 0.4),
    0 0 000px 65px rgba(255, 230, 0, 0.4),
    0 0 00px 100px rgba(255, 230, 0, 0.4);`;
      case 1:
        return `box-shadow: 0 0 0px 30px rgba(255, 230, 0, 0.4),
    0 0 000px 65px rgba(255, 230, 0, 0.4);`;
      case 2:
        return `box-shadow: 0 0 0px 30px rgba(255, 230, 0, 0.4);`;
      default:
        return `display: none;`;
    }
  }

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
          src="../../../../assets/garage.png"
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
              style="position: absolute; height: 20px; width: 20px; z-index: 10; border-radius: 50%; ${this.computeBoxShadow(
                deed.action.timestamp
              )}
 background: yellow; top: ${deed.entry.y}px; left: ${deed.entry.x}px "
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
