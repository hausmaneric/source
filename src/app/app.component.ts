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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  statusMessage: string = ''; // Mensagem de status para o usuário

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
            id: new Uint8Array(32), // ID da chave registrada, substitua conforme necessário
            type: 'public-key'
          }],
          timeout: 60000,
          userVerification: "preferred", // Verificação do usuário preferencial
        };

        this.statusMessage = 'Aguardando autenticação...';

        // Inicia a autenticação
        const credential = await navigator.credentials.get({ publicKey });

        // Exibir credenciais obtidas
        this.statusMessage = 'Autenticação bem-sucedida!';

        // Aqui você pode processar as credenciais conforme necessário
        console.log('Credenciais obtidas:', credential);
      } catch (error) {
        this.statusMessage = 'Erro ao autenticar: ' + error;
        console.error('Erro ao autenticar:', error);
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }
}
