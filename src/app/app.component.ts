import { Component } from '@angular/core';
import { AeternityService } from './services/aeternity.service';
import { AeSdk, AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk';
import { environment } from 'src/environments/environment';

const { networkId } =  environment;

export enum WalletConnectionStatus {
  Error = 0 ,
  Connecting,
  Connected,
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'aepp-boilerplate-angular';
  aeSdk: any;
  resObj: any = {};
  status: WalletConnectionStatus = WalletConnectionStatus.Connecting
  WalletConnectionStatus = WalletConnectionStatus

  constructor(private aeService: AeternityService) {
    const onNetworkChange = (params : any ) => {
      this.showWalletInfo(params.networkId);
    };
    aeService.initSDK(onNetworkChange)
      .then(({walletNetworkId, aeSdk} : {walletNetworkId: string, aeSdk: AeSdk}) => {
        this.aeSdk = aeSdk;
        this.showWalletInfo(walletNetworkId);
    });
  }

  async showWalletInfo(walletNetworkId: string) {
    if (walletNetworkId === networkId) {
      this.resObj.address = await this.aeSdk.address();
      this.resObj.balance = await this.aeSdk.getBalance(this.resObj.address, {
        denomination: AE_AMOUNT_FORMATS.AE,
      });
      this.resObj.rpcClient = await this.aeSdk.rpcClient;
      this.resObj.height = await this.aeSdk.height();
      this.resObj.nodeUrl = (await this.aeSdk.getNodeInfo()).url;
      this.status = WalletConnectionStatus.Connected;
    } else {
      this.resObj.error = `Connected to the wrong network "${walletNetworkId}". please switch to "${networkId}" in your wallet.`;
      this.status = WalletConnectionStatus.Error;
    }
  }

}
