import { Component } from '@angular/core';
import { AeternityService } from './services/aeternity.service';
import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk';
import { Encoded } from '@aeternity/aepp-sdk/es/utils/encoder';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject, switchMap, combineLatest, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = environment.projectName;
  statusMessage$ = new BehaviorSubject<string | undefined>(undefined);
  address$: Observable<Encoded.AccountAddress | undefined>;
  balance$ = new Observable<string | undefined>();
  height$ = new Observable<number | undefined>();
  nodeUrl = environment.nodeUrl;

  constructor(aeService: AeternityService) {
    this.address$ = aeService.address$;
    this.statusMessage$.next('Connecting to wallet...');
    aeService.connectToWallet().then(() => {
      this.statusMessage$.next(undefined);

      aeService.networkId$.subscribe((networkId) => {
        const message = networkId !== environment.networkId
          ? `Connected to the wrong network "${networkId}". please switch to "${environment.networkId}" in your wallet.`
          : undefined;
        this.statusMessage$.next(message);
      });

      this.height$ = aeService.networkId$.pipe(
        switchMap(() => aeService.aeSdk.height()),
      );

      this.balance$ = combineLatest([aeService.address$, aeService.networkId$]).pipe(
        filter(([address, networkId]) => address != null && networkId === environment.networkId),
        switchMap(([address]) => {
          return aeService.aeSdk
            .getBalance(address as Encoded.AccountAddress, { format: AE_AMOUNT_FORMATS.AE });
        }),
      );
    }).catch((error) => {
      console.warn(error);
      this.statusMessage$.next(error.message);
    });
  }
}
