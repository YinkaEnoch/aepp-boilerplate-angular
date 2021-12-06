import { Component } from '@angular/core';
import { AeternityService } from './services/aeternity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'aepp-boilerplate-angular';
  sdk: any;

  constructor(private aeService: AeternityService) {
    aeService.initSDK().then(async (res) => {
      this.sdk = res;

      const address = await this.sdk.address();
      const balance = await this.sdk.balance(address);

      console.log({ address, balance });
      console.log(this.sdk.rpcClient.info);
    });
  }
}
