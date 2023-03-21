// Replace 'ligth.css' with 'dark.css' if you want the dark theme
import { sharedStyles } from "@holochain-open-dev/elements";
import "@holochain-open-dev/elements/elements/display-error.js";
import {
  FileStorageClient,
  fileStorageClientContext,
} from "@holochain-open-dev/file-storage";
import {
  Profile,
  ProfilesClient,
  ProfilesStore,
  profilesStoreContext,
} from "@holochain-open-dev/profiles";
import "@holochain-open-dev/profiles/elements/agent-avatar.js";
import "@holochain-open-dev/profiles/elements/profile-list-item-skeleton.js";
import "@holochain-open-dev/profiles/elements/profile-prompt.js";
import { AsyncStatus, StoreSubscriber } from "@holochain-open-dev/stores";
import {
  ActionHash,
  AppAgentClient,
  AppAgentWebsocket,
} from "@holochain/client";
import { provide } from "@lit-labs/context";
import { localized, msg } from "@lit/localize";
import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { radianceStoreContext } from "./radiance/radiance/context.js";
import { RadianceClient } from "./radiance/radiance/radiance-client.js";
import { RadianceStore } from "./radiance/radiance/radiance-store.js";

import "./radiance/radiance/elements/all-deeds.js";

type View = { view: "main" };

@localized()
@customElement("holochain-app")
export class HolochainApp extends LitElement {
  @provide({ context: fileStorageClientContext })
  @property()
  _fileStorageClient!: FileStorageClient;

  @provide({ context: radianceStoreContext })
  @property()
  _radianceStore!: RadianceStore;

  @state() _loading = true;

  @state() _view = { view: "main" };

  @provide({ context: profilesStoreContext })
  @property()
  _profilesStore!: ProfilesStore;

  _client!: AppAgentClient;

  _myProfile!: StoreSubscriber<AsyncStatus<Profile | undefined>>;

  async firstUpdated() {
    this._client = await AppAgentWebsocket.connect("", "radiance");

    await this.initStores(this._client);

    this._loading = false;
  }

  async initStores(appAgentClient: AppAgentClient) {
    // Don't change this
    this._profilesStore = new ProfilesStore(
      new ProfilesClient(appAgentClient, "radiance")
    );
    this._myProfile = new StoreSubscriber(
      this,
      () => this._profilesStore.myProfile
    );
    this._radianceStore = new RadianceStore(
      new RadianceClient(appAgentClient, "radiance")
    );
    this._fileStorageClient = new FileStorageClient(appAgentClient, "radiance");
  }

  renderMyProfile() {
    switch (this._myProfile.value.status) {
      case "pending":
        return html`<profile-list-item-skeleton></profile-list-item-skeleton>`;
      case "complete":
        const profile = this._myProfile.value.value;
        if (!profile) return html``;

        return html`<div
          class="row"
          style="align-items: center;"
          slot="actionItems"
        >
          <agent-avatar .agentPubKey=${this._client.myPubKey}></agent-avatar>
          <span style="margin: 0 16px;">${profile?.nickname}</span>
        </div>`;
      case "error":
        return html`<display-error
          .headline=${msg("Error fetching the profile")}
          .error=${this._myProfile.value.error.data.data}
          tooltip
        ></display-error>`;
    }
  }

  // TODO: add here the content of your application
  renderContent() {
    return html` <all-deeds style="flex: 1"></all-deeds> `;
  }

  renderBackButton() {
    if (this._view.view === "main") return html``;

    return html`
      <sl-icon-button
        name="arrow-left"
        @click=${() => {
          this._view = { view: "main" };
        }}
      ></sl-icon-button>
    `;
  }

  render() {
    if (this._loading)
      return html`<div
        class="row"
        style="flex: 1; height: 100%; align-items: center; justify-content: center;"
      >
        <sl-spinner style="font-size: 2rem"></sl-spinner>
      </div>`;

    return html`
      <div class="column fill">
        <div
          class="row"
          style="align-items: center; color:white; background-color: var(--sl-color-primary-900); padding: 16px"
        >
          ${this.renderBackButton()}
          <span class="title" style="flex: 1">${msg("Radiance")}</span>

          ${this.renderMyProfile()}
        </div>

        <profile-prompt style="flex: 1;">
          ${this.renderContent()}
        </profile-prompt>
      </div>
    `;
  }

  static styles = [
    css`
      :host {
        display: flex;
        flex: 1;
      }
    `,
    sharedStyles,
  ];
}
