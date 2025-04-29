package com.lansy.project.furia_chat_bot.util;

import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class MatchFormatter {

    public String formatMatches(List<MatchDTO> matches) {
        return matches.stream()
                .map(match ->
                        "🏆 Liga: " + match.getLeagueName() + "\n" +
                                "📈 Série: " + match.getSeriesName() + "\n" +
                                "🎯 Partida: " + match.getMatchName() + "\n" +
                                "🗓️ Data: " + match.getMatchDate() + "\n" +
                                "👥 Times: " + formatTeams(match.getTeams()) + "\n" +
                                (match.getResult() != null ? "📊 Resultado: " + match.getResult() + "\n" : "") +
                                (match.getWinnerName() != null ? "🏅 Vencedor: " + match.getWinnerName() + "\n" : "") +
                                (match.getStreamUrl() != null ? "🔴 Assista: " + match.getStreamUrl() + "\n" : "") +
                                "------------------------------"
                )
                .collect(Collectors.joining("\n"));
    }

    private String formatTeams(List<MatchDTO.TeamDTO> teams) {
        if (teams == null || teams.isEmpty()) {
            return "Times não disponíveis";
        }
        return teams.stream()
                .map(team -> team.getName()) // Aqui estou supondo que o TeamDTO tem um getName()
                .collect(Collectors.joining(" vs "));
    }
}
