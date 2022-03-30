import { Injectable } from '@angular/core';
import {
  RpcAepp,
  Node,
  WalletDetector,
  BrowserWindowMessageConnection,
} from '@aeternity/aepp-sdk';
import { environment } from 'src/environments/environment';
const { projectName, nodeName, nodeUrl, nodeInternalUrl, nodeCompilerUrl } =
  environment;

@Injectable({
  providedIn: 'root',
})
export class AeternityService {
  sdk: any;
  detector;

  constructor() {}

  async initSDK() {
    this.sdk = await RpcAepp({
      name: projectName,
      nodes: [
        {
          name: nodeName,
          instance: await Node({
            url: nodeUrl,
            internalUrl: nodeInternalUrl,
          }),
        },
      ],
      compilerUrl: nodeCompilerUrl,
      onNetworkChange: async (params: any) => {
        this.sdk.selectNode(params.networkId);
      },
      onDisconnect: () => {
        return new Error('Disconnected');
      },
    });

    await this.scanForWallet();
    return this.sdk;
  }

  async scanForWallet() {
    if (!this.sdk) throw new Error('Failed! SDK not initialized.');

    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' },
    });

    const detector = await WalletDetector({ connection: scannerConnection });

    return new Promise((resolve) => {
      detector.scan(async ({ wallets, newWallet }) => {
        newWallet = newWallet || Object.values(wallets)[0];

        await this.sdk.connectToWallet(await newWallet.getConnection());
        await this.sdk?.subscribeAddress('subscribe', 'current');

        detector.stopScan();
        resolve(true);
      });
    });
  }
}
