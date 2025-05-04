package com.lansy.project.furia_chat_bot.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MatchMapper {

    public MatchDTO toMatchDTO(JsonNode matchNode) {
        MatchDTO dto = new MatchDTO();

        // Mapeando o ID da partida
        dto.setId(matchNode.path("id").asInt());

        dto.setLeagueName(matchNode.path("league").path("name").asText());
        dto.setSeriesName(matchNode.path("serie").path("full_name").asText());
        dto.setMatchName(matchNode.path("name").asText());
        dto.setMatchDate(matchNode.path("begin_at").asText());

        // Montando lista de times
        List<MatchDTO.TeamDTO> teams = new ArrayList<>();
        JsonNode opponents = matchNode.path("opponents");
        for (JsonNode opponentNode : opponents) {
            JsonNode teamNode = opponentNode.path("opponent");
            teams.add(new MatchDTO.TeamDTO(
                    teamNode.path("name").asText(),
                    teamNode.path("image_url").asText()
            ));
        }
        dto.setTeams(teams);

        // Resultado
        JsonNode results = matchNode.path("results");
        if (results.size() == 2) {
            int team1Score = results.get(0).path("score").asInt();
            int team2Score = results.get(1).path("score").asInt();
            dto.setResult(team1Score + " x " + team2Score);
        }

        // Nome do vencedor
        JsonNode winner = matchNode.path("winner");
        if (!winner.isMissingNode()) {
            dto.setWinnerName(winner.path("name").asText());
        }

        // Stream URL principal
        JsonNode streams = matchNode.path("streams_list");
        if (streams.isArray() && streams.size() > 0) {
            dto.setStreamUrl(streams.get(0).path("raw_url").asText());
        }

        return dto;
    }

    public List<MatchDTO> toMatchDTOList(JsonNode matchesArray) {
        List<MatchDTO> matches = new ArrayList<>();
        for (JsonNode matchNode : matchesArray) {
            matches.add(toMatchDTO(matchNode));
        }
        return matches;
    }
}