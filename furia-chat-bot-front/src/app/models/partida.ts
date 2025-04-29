export interface Partida {
    leagueName: string;
    seriesName: string;
    matchName: string;
    matchDate: string;
    teams: {
        name: string;
        imageUrl: string;
    }[];
    result: string;
    winnerName: string;
    streamUrl: string;
}