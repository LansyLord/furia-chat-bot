package com.lansy.project.furia_chat_bot.controller;

import com.lansy.project.furia_chat_bot.client.PandaScoreClient;
import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import com.lansy.project.furia_chat_bot.dto.PlayerDTO;
import com.lansy.project.furia_chat_bot.service.ChatService;
import com.lansy.project.furia_chat_bot.util.MatchMapper;
import com.lansy.project.furia_chat_bot.util.PlayerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ChatRestController {

    @Autowired
    ChatService chatService;

    @Autowired
    private PandaScoreClient pandaScoreClient;

    @Autowired
    private PlayerMapper playerMapper;

    @Autowired
    private MatchMapper matchMapper;

    // ✅ Retorna lista com nome dos jogadores
    @GetMapping("/jogadores")
    public ResponseEntity<List<PlayerDTO>> listarJogadores() {
        return ResponseEntity.ok(chatService.buscarJogadores());
    }

    // ✅ Retorna detalhes de um jogador específico (usando ID ou index)
    @GetMapping("/jogadores/{id}")
    public ResponseEntity<PlayerDTO> obterJogador(@PathVariable int id) {
        PlayerDTO jogador = chatService.obterJogadorPorId(id);
        return ResponseEntity.ok(jogador);
    }

    // ✅ Próximas partidas
    @GetMapping("/partidas/proximas")
    public ResponseEntity<List<MatchDTO>> proximasPartidas() {
        return ResponseEntity.ok(chatService.buscarProximosJogos());
    }

    // ✅ Últimas 3 partidas
    @GetMapping("/partidas/ultimas")
    public ResponseEntity<List<MatchDTO>> ultimasPartidas() {
        return ResponseEntity.ok(chatService.buscarUltimos3jogos());
    }
}
