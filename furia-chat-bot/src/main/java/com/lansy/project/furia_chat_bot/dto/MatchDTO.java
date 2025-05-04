package com.lansy.project.furia_chat_bot.dto;

import java.util.List;

public class MatchDTO {
    private int id;
    private String leagueName;
    private String seriesName;
    private String matchName;
    private String matchDate;
    private List<TeamDTO> teams;
    private String result;
    private String winnerName;
    private String streamUrl;

    public static class TeamDTO {
        private String name;
        private String imageUrl;

        public TeamDTO(String name, String imageUrl) {
            this.name = name;
            this.imageUrl = imageUrl;
        }

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    // Getters and setters

    public int getId() {return id;}
    public void setId(int id) {this.id = id;}
    public String getLeagueName() { return leagueName; }
    public void setLeagueName(String leagueName) { this.leagueName = leagueName; }
    public String getSeriesName() { return seriesName; }
    public void setSeriesName(String seriesName) { this.seriesName = seriesName; }
    public String getMatchName() { return matchName; }
    public void setMatchName(String matchName) { this.matchName = matchName; }
    public String getMatchDate() { return matchDate; }
    public void setMatchDate(String matchDate) { this.matchDate = matchDate; }
    public List<TeamDTO> getTeams() { return teams; }
    public void setTeams(List<TeamDTO> teams) { this.teams = teams; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public String getWinnerName() { return winnerName; }
    public void setWinnerName(String winnerName) { this.winnerName = winnerName; }
    public String getStreamUrl() { return streamUrl; }
    public void setStreamUrl(String streamUrl) { this.streamUrl = streamUrl; }
}
