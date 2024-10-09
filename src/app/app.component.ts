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
  statusMessage: string = '';
  challenge: Uint8Array | null = null;
  registeredId: Uint8Array | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Função para converter Uint8Array para Base64
  uint8ArrayToBase64(uint8Array: Uint8Array): string {
    return btoa(String.fromCharCode(...uint8Array));
  }

  // Função para gerar um desafio aleatório
  private generateChallenge(): Uint8Array {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array;
  }

  async register() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.challenge = this.generateChallenge();
        const publicKey: any = {
          challenge: this.challenge,
          rp: { name: 'My App' },
          user: {
            id: new Uint8Array(32), // ID do usuário
            name: 'user@example.com',
            displayName: 'User Example',
          },
          pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'preferred',
          },
        };

        this.statusMessage = 'Registrando...';
        const credential: any = await navigator.credentials.create({ publicKey });
        this.registeredId = new Uint8Array(credential.id); // Armazenar o ID da credencial

        this.statusMessage = 'Registro bem-sucedido!';
      } catch (error) {
        this.statusMessage = 'Erro ao registrar: ' + error;
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }

  async authenticate() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.registeredId || !this.challenge) {
        this.statusMessage = 'Credencial não registrada ou desafio ausente.';
        return;
      }

      try {
        const publicKey: any = {
          challenge: this.generateChallenge(),
          allowCredentials: [
            {
              id: this.registeredId,
              type: 'public-key',
            },
          ],
          timeout: 60000,
          userVerification: 'preferred',
        };

        this.statusMessage = 'Aguardando autenticação...';
        const credential = await navigator.credentials.get({ publicKey });

        this.statusMessage = 'Autenticação bem-sucedida!';
      } catch (error) {
        this.statusMessage = 'Erro ao autenticar: ' + error;
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }
}
