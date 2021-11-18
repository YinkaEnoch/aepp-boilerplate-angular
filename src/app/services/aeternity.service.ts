import { Injectable } from '@angular/core';
import { RpcAepp, Node } from '@aeternity/aepp-sdk';
import Detector from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/wallet-detector';
import BrowserWindowMessageConnection from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-window-message';
import { environment } from 'src/environments/environment';
const { nodeName, nodeUrl, nodeInternalUrl, nodeCompilerUrl } = environment;

@Injectable({
  providedIn: 'root',
})
export class AeternityService {
  constructor() {}

  async initSDK() {
    try {
      const node = {
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
      };

      const sdk = await RpcAepp({
        name: nodeName,
        ...node,
      });

      await this.scanForWallet(sdk);

      return sdk;
    } catch (e) {
      console.error(e);
      return e;
    }
  }

  async scanForWallet(sdk: any) {
    if (!sdk) throw new Error('Failed! SDK not initialized.');

    const scannerConnection = await BrowserWindowMessageConnection({
      connectionInfo: { id: 'spy' },
    });

    const detector = await Detector({ connection: scannerConnection });

    return new Promise((resolve) => {
      detector.scan(async ({ newWallet }) => {
        if (!newWallet) return;

        if (window.confirm(`Connect to ${newWallet.name} wallet?`)) {
          await sdk?.connectToWallet(await newWallet.getConnection());
          await sdk?.subscribeAddress('subscribe', 'current');

          detector.stopScan();
          resolve(true);
        }
      });
    });
  }
}
