package com.lansy.project.furia_chat_bot.controller;

import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import com.lansy.project.furia_chat_bot.model.EmailRequest;
import com.lansy.project.furia_chat_bot.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/v1")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/notificacoes/proxima-partida")
    public ResponseEntity<Void> cadastrarEmail(@RequestBody EmailRequest request) {
        notificationService.cadastrarEmailParaNotificacao(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/notificacoes/testar-envio")
    public ResponseEntity<Void> testarNotificacao() {
        // Criar uma MatchDTO de exemplo
        MatchDTO partidaTeste = criarPartidaTeste();

        // Notificar usando os dados reais da DTO
        notificationService.notificarTodosSobreNovaPartida(criarPartidaTeste());

        return ResponseEntity.ok().build();
    }

    private MatchDTO criarPartidaTeste() {
        MatchDTO partida = new MatchDTO();
        partida.setId(9999); // ID fictício
        partida.setLeagueName("ESL Pro League");
        partida.setSeriesName("Season 19");
        partida.setMatchName("FURIA vs Team Liquid");
        partida.setMatchDate("05/05/2025 19:00");

        // Criando times
        MatchDTO.TeamDTO furia = new MatchDTO.TeamDTO("FURIA", "https://example.com/furia.png");
        MatchDTO.TeamDTO liquid = new MatchDTO.TeamDTO("Team Liquid", "https://example.com/liquid.png");
        partida.setTeams(List.of(furia, liquid));

        partida.setStreamUrl("https://twitch.tv/furia");

        return partida;
    }

}
