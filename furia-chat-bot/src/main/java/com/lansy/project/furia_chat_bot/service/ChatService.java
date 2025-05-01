package com.lansy.project.furia_chat_bot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.lansy.project.furia_chat_bot.client.PandaScoreClient;
import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import com.lansy.project.furia_chat_bot.dto.PlayerDTO;
import com.lansy.project.furia_chat_bot.util.MatchMapper;
import com.lansy.project.furia_chat_bot.util.PlayerMapper;
import jakarta.el.PropertyNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ChatService {

    @Autowired
    private PandaScoreClient pandaScoreClient;

    @Autowired
    private PlayerMapper playerMapper;

    @Autowired
    private MatchMapper matchMapper;


    public List<MatchDTO> buscarProximosJogos() {
        return matchMapper.toMatchDTOList(pandaScoreClient.buscarProximosJogos());
    }

    public List<MatchDTO> buscarUltimos3jogos() {
        return matchMapper.toMatchDTOList(pandaScoreClient.buscarUltimos3Jogos());
    }

    public List<PlayerDTO> buscarJogadores(){
        JsonNode json = pandaScoreClient.buscarPerfilJogadores();
        return playerMapper.toPlayerDTOList(json);
    }

    public PlayerDTO obterJogadorPorId(int id) {
        return buscarJogadores().stream()
                .filter(j -> j.getId() == id)
                .findFirst()
                .orElseThrow(() -> new PropertyNotFoundException("Jogador não encontrado"));
    }
}
