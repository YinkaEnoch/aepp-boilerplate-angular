import { Component } from '@angular/core';
import { AeternityService } from './services/aeternity.service';
import { AmountFormatter } from '@aeternity/aepp-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'aepp-boilerplate-angular';
  sdk: any;
  resObj: any = {};

  constructor(private aeService: AeternityService) {
    aeService.initSDK().then(async (res) => {
      this.sdk = res;

      this.resObj.address = await this.sdk.address();
      this.resObj.balance = await this.sdk.balance(this.resObj.address, {
        denomination: AmountFormatter.AE_AMOUNT_FORMATS.AE,
      });
      this.resObj.rpcClient = await this.sdk.rpcClient;
      this.resObj.height = await this.sdk.height();
      this.resObj.nodeUrl = (await this.sdk.getNodeInfo()).url;

      console.log(this.sdk.rpcClient);
    });
  }
}
