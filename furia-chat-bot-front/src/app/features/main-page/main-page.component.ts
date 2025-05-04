import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChatService } from '../../services/chat.service';
import { Match } from '../../models/match';
import { FutureMatch } from '../../models/future-match';
import { Player } from '../../models/player';
import { firstValueFrom } from 'rxjs';

interface ChatMessage {
  text: string;
  isBot: boolean;
  icon: string;
  isMatch?: boolean;
  matches?: Match[];
  isPlayerList?: boolean;
  players?: Player[];
  isPlayerDetailPrompt?: boolean;
  isContinuePrompt?: boolean;
  isTypingIndicator: boolean;
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {
  @ViewChild('inputChat') inputChatRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('cardBody') cardBodyRef!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = []

  private currentPlayers: Player[] = [];
  private currentState: 'mainMenu' | 'awaitingPlayerResponse' | 'awaitingPlayerNumber' | 'awaitingContinueResponse' | 'awaitingEmailForNextMatch' = 'mainMenu';


  constructor(private chatService: ChatService) { }

  showWelcome = true;

  async manageChat() {
    if (!this.inputChatRef?.nativeElement) return;

    const message = this.inputChatRef.nativeElement.value.trim();
    this.inputChatRef.nativeElement.value = '';

    if (!message) return;

    if (this.showWelcome) {
      this.showWelcome = false;
    }

    this.addMessage(message, false, 'fa-user');


    try {


      if (this.currentState === 'awaitingContinueResponse') {
        await this.showTypingIndicator();
        this.handleContinueResponse(message);
        return;
      }

      if (this.currentState === 'awaitingPlayerResponse') {
        this.handlePlayerSelection(message);
        return;
      }

      if (this.currentState === 'awaitingPlayerNumber') {
        this.handlePlayerNumberSelection(message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.scrollToBottom();
        return;
      }

      if (this.currentState === 'awaitingEmailForNextMatch') {
        const email = message.toLowerCase().trim();
        this.addMessage('Cadastrando Email...', true, 'fa-robot');
        if (!this.isValidEmail(email)) {
          this.addMessage('E-mail inválido. Por favor, digite um endereço de e-mail válido.', true, 'fa-robot');
          return;
        }

        try {
          await firstValueFrom(this.chatService.subscribeToNextMatchEmail(email));
          this.addMessage(`✅ E-mail cadastrado com sucesso! Você será avisado quando a próxima partida da FURIA for marcada.`, true, 'fa-robot');
        } catch (error) {
          console.error(error);
          this.addMessage('❌ Ocorreu um erro ao cadastrar seu e-mail. Tente novamente mais tarde.', true, 'fa-robot');
        }

        this.currentState = 'mainMenu';
        this.askToContinue();
        return;
      }

      let response: any;

      switch (message) {
        case '1':
          await new Promise(resolve => setTimeout(resolve, 1500 / 2));
          let typingMsg = this.addMessage('Digitando...', true, 'fa-robot');
          await new Promise(resolve => setTimeout(resolve, 1500));
          const proximaPartida = await firstValueFrom(this.chatService.getProximasPartidas());
          this.messages = this.messages.filter(msg => msg !== typingMsg);
          response = { resposta: proximaPartida };
          break;

        case '2':
          await new Promise(resolve => setTimeout(resolve, 1500 / 2));
          const typingMsg2 = this.addMessage('Digitando...', true, 'fa-robot');
          await new Promise(resolve => setTimeout(resolve, 1500));
          const ultimasPartidas = await firstValueFrom(this.chatService.getUltimasPartidas());
          this.messages = this.messages.filter(msg => msg !== typingMsg2);
          response = { resposta: ultimasPartidas };
          break;

        case '3':
          await new Promise(resolve => setTimeout(resolve, 1500 / 2));
          const typingMsg3 = this.addMessage('Digitando...', true, 'fa-robot');
          await new Promise(resolve => setTimeout(resolve, 1500));
          const players = await firstValueFrom(this.chatService.getJogadores());
          this.messages = this.messages.filter(msg => msg !== typingMsg3);
          const activePlayers = this.filterInactivePlayers(players);
          response = { resposta: activePlayers };
          break;

        case '4':
          await this.showTypingIndicator();
          response = {
            resposta: `A FURIA Esports é uma organização brasileira fundada em 2017, inicialmente focada em CS:GO. Criada por Jaime Pádua e André Akkari, a equipe se destacou pelo estilo agressivo de jogo e por sua disciplina fora do servidor. Com campanhas de sucesso internacionais desde 2019, se consolidou como uma das principais equipes do mundo. Hoje, a FURIA compete em diversos jogos e é uma das organizações mais respeitadas da América Latina.`
          };
          break;

        case '5':
          await this.showTypingIndicator();
          this.messages = this.messages.filter(msg => msg.text !== 'Digitando...');
          this.addMessage('Digite seu e-mail para receber notificações da próxima partida da FURIA:', true, 'fa-robot');
          this.currentState = 'awaitingEmailForNextMatch';
          return;

        case 'menu':
          await this.showTypingIndicator();
          this.showMainMenu();
          break;

        default:
          this.addMessage('Opção inválida. Digite um número de 1 a 5.', true, 'fa-robot');
          return;
      }

      if (response?.resposta) {
        if (message === '1') {
          const formattedResponse = this.formatFutureMatches(response.resposta);
          if (formattedResponse === '') {
            this.addMessage('Nenhuma partida da FURIA agendada no momento.', true, 'fa-robot');
          } else {
            this.addMessage(formattedResponse, true, 'fa-robot');
          }
          this.askToContinue();
        }
        else if (message === '2') {
          const formattedResponse = this.formatPastMatches(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot');
          this.askToContinue();
        }
        else if (message === '3') {
          this.currentPlayers = response.resposta;
          const formattedResponse = this.formatPlayers(response.resposta);
          this.addMessage(formattedResponse, true, 'fa-robot', true);
          this.currentState = 'awaitingPlayerResponse';
          this.addPlayerDetailPrompt();
        }
        else if (message === '4') {
          this.addMessage(response.resposta, true, 'fa-robot');
          this.askToContinue();
        }
      }

    } catch (error) {
      this.addMessage('Desculpe, ocorreu um erro ao processar sua mensagem.', true, 'fa-robot');
      console.error('Erro na API:', error);
    }
  }

  private askToContinue() {
    this.currentState = 'awaitingContinueResponse';
    this.addMessage(
      'Posso ajudar em algo mais? (Responda "sim" ou "não")',
      true,
      'fa-robot',
      false,
      undefined,
      false,
      true
    );
  }

  private handleContinueResponse(response: string) {
    const lowerResponse = response.toLowerCase().trim();

    if (lowerResponse !== 'sim' && lowerResponse !== 'não' && lowerResponse !== 'nao') {
      this.addMessage('Por favor, responda "sim" ou "não".', true, 'fa-robot');
      this.askToContinue();
      return;
    }

    if (lowerResponse === 'sim') {
      this.showMainMenu();
    } else {
      this.addMessage(
        'Obrigado por conversar comigo! Se precisar de mais informações, é só digitar qualquer uma das opções disponíveis que eu volto a ativa! Se quiser ver o menu novamente digite `menu`. #FURIACS',
        true,
        'fa-robot'
      );
    }
    this.currentState = 'mainMenu';
  }

  private addPlayerDetailPrompt() {
    this.addMessage(
      `Deseja ver detalhes sobre algum jogador? (Responda "sim" ou "não")`,
      true,
      'fa-robot',
      false,
      undefined,
      true
    );
  }

  private handlePlayerSelection(response: string) {
    const lowerResponse = response.toLowerCase().trim();

    if (lowerResponse !== 'sim' && lowerResponse !== 'não' && lowerResponse !== 'nao') {
      this.addMessage('Por favor, responda "sim" ou "não".', true, 'fa-robot');
      this.addPlayerDetailPrompt();
      return;
    }

    if (lowerResponse === 'não' || lowerResponse === 'nao') {
      this.addMessage('Ok, voltando ao menu principal.', true, 'fa-robot');
      this.showMainMenu();
      return;
    }

    this.addMessage(
      `Digite o número correspondente ao jogador (1 a ${this.currentPlayers.length}):`,
      true,
      'fa-robot'
    );
    this.currentState = 'awaitingPlayerNumber';
  }

  private handlePlayerNumberSelection(selection: string) {
    const selectedNumber = parseInt(selection);

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > this.currentPlayers.length) {
      this.addMessage(`Por favor, digite um número de 1 a ${this.currentPlayers.length}.`, true, 'fa-robot');
      return;
    }

    const selectedPlayer = this.currentPlayers[selectedNumber - 1];

    // Additional safety check
    if (this.isInactivePlayer(selectedPlayer)) {
      this.addMessage('This player is no longer on FURIA\'s main roster.', true, 'fa-robot');
      return;
    }

    this.showPlayerDetails(selectedPlayer);
    this.askToContinue();
  }

  private isInactivePlayer(player: Player): boolean {
    const playersToRemove = ['chelo', 'skullz', 'guerri'];
    const nickname = player.nickname?.toLowerCase();
    const fullName = `${player.firstName?.toLowerCase()} ${player.lastName?.toLowerCase()}`;

    return playersToRemove.some(
      nameToRemove => nickname?.includes(nameToRemove) || fullName?.includes(nameToRemove)
    );
  }

  private showMainMenu() {
    this.addMessage(
      `Digite um dos números abaixo para receber informações:
      
  1️⃣ - Próxima partida da FURIA
  2️⃣ - Últimas 3 Partidas da FURIA
  3️⃣ - Equipe de Counter-Strike 2
  4️⃣ - História da FURIA
  5️⃣ - Casdastrar e-mail para receber próximas partidas`,
      true,
      'fa-robot'
    );
    this.currentState = 'mainMenu';
    this.scrollToBottom();
  }

  private showPlayerDetails(player: Player) {
    const birthday = player.birthday ? new Date(player.birthday).toLocaleDateString('pt-BR') : 'Não informado';
    const age = player.age ? `${player.age} anos` : 'Não informado';
    const instagramLink = player.socialMedia?.startsWith('@')
      ? `<a href="https://instagram.com/${player.socialMedia.substring(1).trim()}" target="_blank" class="social-link">${player.socialMedia}</a>`
      : player.socialMedia || 'Não informado';

    const details = `
      🎮 ${player.nickname}
      👤 Nome completo: ${player.fullName || player.firstName + ' ' + player.lastName}
      🔫 Função em jogo: ${player.role}
      📸 Instagram: ${instagramLink}
      🏳️ Nacionalidade: ${player.nationality || 'Não informada'}
      🎂 Data de nascimento: ${birthday}
      📅 Idade: ${age}
      ${player.imageUrl ? `<img src="${player.imageUrl}" alt="${player.nickname}" class="player-image">` : ''}
    `;

    this.addMessage(details, true, 'fa-robot');
  }

  private formatPastMatches(matches: Match[]): string {
    return matches.map(match => {
      return `
    🏆 ${match.leagueName} - ${match.seriesName}
    ⚔️ ${match.matchName}
    📅 ${new Date(match.matchDate).toLocaleDateString('pt-BR')}
    🏆 Resultado: ${match.result}
    🎉 Vencedor: ${match.winnerName}
    📺 <a href="${match.streamUrl}" target="_blank" class="stream-link">Ver Transmissão</a>
      `;
    }).join('\n\n');
  }

  private formatFutureMatches(matches: FutureMatch[]): string {
    return matches.map(match => {
      const matchDate = new Date(match.matchDate);
      const formattedDate = matchDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
      🏟️ ${match.leagueName} - ${match.seriesName}
      ⚔️<strong>${match.teams[0].name}</strong> vs <strong>${match.teams[1].name}</strong>
      📅 ${formattedDate}
      📺 <a href="${match.streamUrl}" target="_blank" class="stream-link">Ver Transmissão</a>
      `;
    }).join('\n\n');
  }

  private formatPlayers(players: Player[]): string {
    return `👥 Elenco Principal da FURIA:\n\n` +
      players.map((player, index) =>
        `${index + 1}️⃣ ${player.nickname || player.firstName} ${player.firstName ? `(${player.firstName} ${player.lastName})` : ''}`
      ).join('\n');
  }

  private filterInactivePlayers(players: Player[]): Player[] {

    const playersToRemove = ['chelo', 'skullz', 'guerri'];
    return players.filter(player => {

      const nickname = player.nickname?.toLowerCase();
      const fullName = `${player.firstName?.toLowerCase()} ${player.lastName?.toLowerCase()}`;

      return !playersToRemove.some(
        nameToRemove => nickname?.includes(nameToRemove) || fullName?.includes(nameToRemove)
      );
    });
  }

  selectWelcomeOption(optionNumber: string) {
    this.showWelcome = false;
    this.inputChatRef.nativeElement.value = optionNumber;
    this.manageChat();
  }

  private addMessage(
    text: string,
    isBot: boolean,
    icon: string,
    isPlayerList: boolean = false,
    players: Player[] = [],
    isPlayerDetailPrompt: boolean = false,
    isContinuePrompt: boolean = false,
    isTypingIndicator: boolean = false
  ): ChatMessage {
    const newMsg = {
      text,
      isBot,
      icon,
      isPlayerList,
      players,
      isPlayerDetailPrompt,
      isContinuePrompt,
      isTypingIndicator
    };
    this.messages.push(newMsg);
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
    return newMsg;
  }

  private async showTypingIndicator(duration: number = 1000): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, duration / 2));
    const typingMsg = this.addMessage('Digitando...', true, 'fa-robot');
    await new Promise(resolve => setTimeout(resolve, duration));
    this.messages = this.messages.filter(msg => msg !== typingMsg);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      // Opção 1: Rolar a página inteira (window)
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 25);
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}