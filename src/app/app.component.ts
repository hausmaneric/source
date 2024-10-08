import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { WebcamModule, WebcamImage } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { FaceAuthService } from './face-auth.service';  // Certifique-se de ajustar o caminho
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, WebcamModule, HttpClientModule],
  providers: [FaceAuthService],
  template: `
<div>
  <h3>Leitor de Digital</h3>
  <button (click)="authenticate()">Ler Impressão Digital</button>
</div>

  `
})
export class AppComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async authenticate() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Gerar um desafio aleatório
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        // Define as opções para a autenticação
        const publicKey: any = {
          challenge: challenge,
          allowCredentials: [{
            id: new Uint8Array(32), // ID da chave registrada
            type: 'public-key'
          }],
          timeout: 60000,
          userVerification: "preferred",
        };

        // Inicia a autenticação
        const credential = await navigator.credentials.get({ publicKey });
        console.log('Credenciais obtidas:', credential);

        // Aqui você pode processar as credenciais conforme necessário
      } catch (error) {
        console.error('Erro ao autenticar:', error);
      }
    }
  }
}
