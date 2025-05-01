package com.lansy.project.furia_chat_bot.client;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PandaScoreClient {

    private final RestTemplate restTemplate;

    @Value("${pandascore.api.token}")
    private String apiToken;

    public PandaScoreClient() {
        this.restTemplate = new RestTemplate();
        // Garante que RestTemplate entende JSON
        this.restTemplate.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
    }

    public JsonNode buscarUltimos3Jogos() {
        String url = "https://api.pandascore.co/csgo/matches?filter[opponent_id]=124530&filter[status]=finished&sort=-begin_at&per_page=3&token=" + apiToken;
        return restTemplate.getForObject(url, JsonNode.class);
    }

    public JsonNode buscarProximosJogos() {
        String url = "https://api.pandascore.co/csgo/matches/upcoming?filter[opponent_id]=130564&token=" + apiToken;
        return restTemplate.getForObject(url, JsonNode.class);
    }

    public JsonNode buscarPerfilJogadores() {
        String url = "https://api.pandascore.co/csgo/teams?filter[id]=124530&token=" + apiToken;
        return restTemplate.getForObject(url, JsonNode.class);
    }

    public String buscarCuriosidades() {
        return "Você sabia? A FURIA foi o primeiro time brasileiro a vencer o ECS Season 7!";
    }
}

