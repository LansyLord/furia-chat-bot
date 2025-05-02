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

  messages: ChatMessage[] = [
    {
      text: `Fala, guerreiro(a)! Aqui é o contato inteligente da FURIA!
  
  Digite um dos números abaixo para receber informações:
  
  1️⃣ - Próxima partida agendada
  2️⃣ - Últimas 3 Partidas da FURIA
  3️⃣ - Jogadores do elenco principal
  4️⃣ - História da FURIA
  5️⃣ - 
  
  Qualquer outro número: Menu de opções`,
      isBot: true,
      icon: 'fa-robot'
    }
  ];

  private currentPlayers: Player[] = [];
  private currentState: 'mainMenu' | 'awaitingPlayerResponse' | 'awaitingPlayerNumber' | 'awaitingContinueResponse' = 'mainMenu';

  constructor(private chatService: ChatService) { }

  async manageChat() {
    if (!this.inputChatRef?.nativeElement) return;

    const message = this.inputChatRef.nativeElement.value.trim();
    this.inputChatRef.nativeElement.value = '';

    if (!message) return;

    this.addMessage(message, false, 'fa-user');

    try {
      // Lidar com respostas de confirmação
      if (this.currentState === 'awaitingContinueResponse') {
        this.handleContinueResponse(message);
        return;
      }

      if (this.currentState === 'awaitingPlayerResponse') {
        this.handlePlayerSelection(message);
        return;
      }

      if (this.currentState === 'awaitingPlayerNumber') {
        this.handlePlayerNumberSelection(message);
        return;
      }

      const thinkingMsg = this.addMessage('Digitando...', true, 'fa-robot');

      let response: any;

      switch (message) {
        case '1':
          const proximaPartida = await firstValueFrom(this.chatService.getProximasPartidas());
          response = { resposta: proximaPartida };
          break;

        case '2':
          const ultimasPartidas = await firstValueFrom(this.chatService.getUltimasPartidas());
          response = { resposta: ultimasPartidas };
          break;

        case '3':
          const players = await firstValueFrom(this.chatService.getJogadores());
          const activePlayers = this.filterInactivePlayers(players);
          response = { resposta: activePlayers };
          break;

        case '4':
          response = {
            resposta: `A FURIA Esports é uma organização brasileira fundada em 2017, inicialmente focada em CS:GO. Criada por Jaime Pádua e André Akkari, a equipe se destacou pelo estilo agressivo de jogo e por sua disciplina fora do servidor. Com campanhas de sucesso internacionais desde 2019, se consolidou como uma das principais equipes do mundo. Hoje, a FURIA compete em diversos jogos e é uma das organizações mais respeitadas da América Latina.`
          };
          break;

        case 'menu':
          this.showMainMenu();
          break;

        default:
          this.addMessage('Opção inválida. Digite 1, 2 ou 3.', true, 'fa-robot');
          return;
      }

      this.messages = this.messages.filter(msg => msg !== thinkingMsg);

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
      this.askToContinue();
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
      this.addMessage(`Please enter a number between 1 and ${this.currentPlayers.length}.`, true, 'fa-robot');
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
      
  1️⃣ - Próxima partida agendada
  2️⃣ - Últimas 3 Partidas da FURIA
  3️⃣ - Jogadores do elenco principal
  4️⃣ - História da FURIA
  5️⃣ - 
  
  Qualquer outro número: Menu de opções`,
      true,
      'fa-robot'
    );
    this.currentState = 'mainMenu';
  }

  private showPlayerDetails(player: Player) {
    const birthday = player.birthday ? new Date(player.birthday).toLocaleDateString('pt-BR') : 'Não informado';
    const age = player.age ? `${player.age} anos` : 'Não informado';
    const instagramLink = player.socialMedia?.startsWith('@')
      ? `<a href="https://instagram.com/${player.socialMedia.substring(1).trim()}" target="_blank"
         class="social-link">
         ${player.socialMedia}
       </a>`
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

  private addMessage(
    text: string,
    isBot: boolean,
    icon: string,
    isPlayerList: boolean = false,
    players: Player[] = [],
    isPlayerDetailPrompt: boolean = false,
    isContinuePrompt: boolean = false
  ): ChatMessage {
    const newMsg = {
      text,
      isBot,
      icon,
      isPlayerList,
      players,
      isPlayerDetailPrompt,
      isContinuePrompt
    };
    this.messages.push(newMsg);
    this.scrollToBottom();
    return newMsg;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.cardBodyRef.nativeElement.scrollTop = this.cardBodyRef.nativeElement.scrollHeight;
    }, 100);
  }
}