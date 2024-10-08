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

  async register() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const publicKey: any = {
          challenge: new Uint8Array(32), // Desafio aleatório
          rp: {
            name: 'My App',
          },
          user: {
            id: new Uint8Array(32), // ID do usuário, deve ser único
            name: 'user@example.com',
            displayName: 'User Example',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // Algoritmo para gerar a chave
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Usar o autenticador do dispositivo
            userVerification: 'preferred',
          },
        };

        this.statusMessage = 'Registrando...';

        const credential = await navigator.credentials.create({ publicKey });

        // Aqui você deve enviar a credencial para o seu servidor para armazená-la
        console.log('Credencial registrada:', credential);
        this.statusMessage = 'Registro bem-sucedido!';
      } catch (error) {
        this.statusMessage = 'Erro ao registrar: ' + error;
        console.error('Erro ao registrar:', error);
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }

  async authenticate() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const publicKey: any = {
          challenge: new Uint8Array(32), // Desafio aleatório
          allowCredentials: [
            {
              id: new Uint8Array(32), // ID da chave registrada, substitua conforme necessário
              type: 'public-key',
            },
          ],
          timeout: 60000,
          userVerification: 'preferred',
        };

        this.statusMessage = 'Aguardando autenticação...';

        const credential = await navigator.credentials.get({ publicKey });

        this.statusMessage = 'Autenticação bem-sucedida!';
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
