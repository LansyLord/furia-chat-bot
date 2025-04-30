package com.lansy.project.furia_chat_bot.service;



import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lansy.project.furia_chat_bot.client.PandaScoreClient;
import com.lansy.project.furia_chat_bot.model.MensagemRequest;
import com.lansy.project.furia_chat_bot.model.MensagemResponse;
import com.lansy.project.furia_chat_bot.util.MatchFormatter;
import com.lansy.project.furia_chat_bot.util.MatchMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    @Autowired
    private PandaScoreClient pandaScoreClient;

    @Autowired
    private MatchMapper matchMapper;

    public MensagemResponse<?> processarMensagem(MensagemRequest mensagemRequest) {
        String comando = mensagemRequest.getMensagem().toLowerCase();

        if (comando.contains("1")) {
            // Retorna a lista de partidas como objeto JSON
            return new MensagemResponse<>(matchMapper.toMatchDTOList(pandaScoreClient.buscarProximosJogos()));
        } else if (comando.contains("2")) {
            return new MensagemResponse<>(matchMapper.toMatchDTOList(pandaScoreClient.buscarUltimos3Jogos()));
        } else if (comando.contains("3")) {
            return new MensagemResponse<>(pandaScoreClient.buscarPerfilJogadores());
        } else if (comando.contains("4")) {
            return new MensagemResponse<>(pandaScoreClient.buscarCuriosidades());
        } else {
            return new MensagemResponse<>("Comando não reconhecido. Tente um dos números disponíveis.");
        }
    }
}
