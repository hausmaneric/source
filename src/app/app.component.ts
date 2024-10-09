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
  registeredIds: string[] = [];  // Array para armazenar múltiplos IDs

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Função para converter ArrayBuffer ou qualquer binário em Base64
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return window.btoa(binary);  // Converte para Base64
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

        if (credential) {
          const registeredId = this.arrayBufferToBase64(credential.rawId);  // Armazenar ID como Base64
          this.registeredIds.push(registeredId);  // Adicionar ao array de IDs
          this.statusMessage = `Registro bem-sucedido! IDs registrados: ${this.registeredIds.join(', ')}`;
        } else {
          this.statusMessage = 'Falha no registro.';
        }
      } catch (error) {
        this.statusMessage = 'Erro ao registrar: ' + error;
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }

  async authenticate() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.registeredIds.length === 0 || !this.challenge) {
        this.statusMessage = 'Nenhuma credencial registrada ou desafio ausente.';
        return;
      }

      try {
        const publicKey: any = {
          challenge: this.generateChallenge(),
          allowCredentials: this.registeredIds.map(id => ({
            id: Uint8Array.from(atob(id), c => c.charCodeAt(0)),  // Convertendo de Base64 para Uint8Array
            type: 'public-key',
          })),
          timeout: 60000,
          userVerification: 'preferred',
        };

        this.statusMessage = 'Aguardando autenticação...';
        const credential = await navigator.credentials.get({ publicKey });

        if (credential) {
          this.statusMessage = 'Autenticação bem-sucedida!';
        } else {
          this.statusMessage = 'Falha na autenticação.';
        }
      } catch (error) {
        this.statusMessage = 'Erro ao autenticar: ' + error;
      }
    } else {
      this.statusMessage = 'Este recurso não está disponível neste dispositivo.';
    }
  }
}
