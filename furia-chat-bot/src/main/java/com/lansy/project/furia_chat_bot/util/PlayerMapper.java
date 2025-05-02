package com.lansy.project.furia_chat_bot.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.lansy.project.furia_chat_bot.dto.PlayerDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class PlayerMapper {

    public List<PlayerDTO> toPlayerDTOList(JsonNode json) {
        List<PlayerDTO> jogadores = new ArrayList<>();

        if (!json.isArray() || json.isEmpty()) {
            return jogadores;
        }

        JsonNode playersArray = json.get(0).path("players");
        if (!playersArray.isArray()) {
            return jogadores;
        }

        for (JsonNode playerNode : playersArray) {
            PlayerDTO player = new PlayerDTO();

            player.setId(playerNode.path("id").asInt(0));
            player.setNickname(playerNode.path("name").asText(""));

            switch(player.getNickname()){
                case "YEKINDAR":
                        player.setRole("Entry Fragger");
                        player.setSocialMedia("@yek1ndar");
                        break;
                case "FalleN":
                    player.setRole("IGL | Rifler");
                    player.setSocialMedia("@fallen");
                    break;
                case "yuurih":
                    player.setRole("Rifler");
                    player.setSocialMedia("@yuurihfps");
                    break;
                case "KSCERATO":
                    player.setRole("Rifler");
                    player.setSocialMedia("@kscerato");
                    break;
                case "molodoy":
                    player.setRole("Awper");
                    player.setSocialMedia("@danil.molodoy_");
                    break;
                default:
                    player.setRole("Sem informações");
                    player.setSocialMedia("Sem informações");
            }

            player.setFirstName(playerNode.path("first_name").asText(""));
            player.setLastName(playerNode.path("last_name").asText(""));
            player.setFullName(player.getFirstName() + " '" + player.getNickname() + "' " + player.getLastName());
            player.setNationality(playerNode.path("nationality").asText(""));
            player.setBirthday(playerNode.path("birthday").asText(""));
            player.setAge(playerNode.path("age").asInt(0));
            player.setImageUrl(playerNode.path("image_url").asText(""));

            jogadores.add(player);
        }

        return jogadores;
    }
}
