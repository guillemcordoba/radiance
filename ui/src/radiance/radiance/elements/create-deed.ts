import {
  hashProperty,
  hashState,
  notifyError,
  onSubmit,
  sharedStyles,
  wrapPathInSvg,
} from "@holochain-open-dev/elements";
import "@holochain-open-dev/elements/elements/display-error.js";
import "@holochain-open-dev/file-storage/elements/upload-files.js";
import { EntryRecord } from "@holochain-open-dev/utils";
import { consume } from "@lit-labs/context";
import { localized, msg } from "@lit/localize";
import { mdiAlertCircleOutline, mdiDelete } from "@mdi/js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea.js";
import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { radianceStoreContext } from "../context.js";
import { RadianceStore } from "../radiance-store.js";
import { Deed } from "../types.js";

/**
 * @element create-deed
 * @fires deed-created: detail will contain { deedHash }
 */
@localized()
@customElement("create-deed")
export class CreateDeed extends LitElement {
  // REQUIRED. The x for this Deed
  @property()
  x!: number;

  // REQUIRED. The y for this Deed
  @property()
  y!: number;

  /**
   * @internal
   */
  @consume({ context: radianceStoreContext, subscribe: true })
  radianceStore!: RadianceStore;

  /**
   * @internal
   */
  @state()
  committing = false;

  /**
   * @internal
   */
  @query("#create-form")
  form!: HTMLFormElement;

  async createDeed(fields: any) {
    if (this.x === undefined)
      throw new Error("Cannot create a new Deed without its x field");
    if (this.y === undefined)
      throw new Error("Cannot create a new Deed without its y field");

    const deed: Deed = {
      ...fields,
      x: this.x,
      y: this.y,
    };

    try {
      this.committing = true;
      const record: EntryRecord<Deed> =
        await this.radianceStore.client.createDeed(deed);

      this.dispatchEvent(
        new CustomEvent("deed-created", {
          composed: true,
          bubbles: true,
          detail: {
            deedHash: record.actionHash,
          },
        })
      );

      this.form.reset();
    } catch (e: any) {
      notifyError(msg("Error creating the deed"));
      console.error(e);
    }
    this.committing = false;
  }

  render() {
    return html`
      <form
        id="create-form"
        style="display: flex; flex: 1; flex-direction: column;"
        ${onSubmit((fields) => this.createDeed(fields))}
      >
        <div style="margin-bottom: 16px;">
          <sl-input name="title" .label=${msg("Title")} required></sl-input>
        </div>

        <div style="margin-bottom: 16px;">
          <sl-textarea
            name="description"
            .label=${msg("Description")}
            required
          ></sl-textarea>
        </div>

        <div style="margin-bottom: 16px;">
          <upload-files
            name="image_hash"
            .oneFile=${true}
            accepted-files="image/jpeg,image/png,image/gif"
            required
          ></upload-files>
        </div>

        <sl-button variant="primary" type="submit" .loading=${this.committing}
          >${msg("Create Deed")}</sl-button
        >
      </form>
    `;
  }

  static styles = [sharedStyles];
}
