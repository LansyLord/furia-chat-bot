export interface FutureMatch {
    leagueName: string;
    seriesName: string;
    matchName: string;
    matchDate: string | Date;
    teams: {
        name: string;
        imageUrl: string;
    }[];
    streamUrl: string;
}

// Tipo de resposta da API para partidas futuras
export interface FutureMatchesResponse {
    resposta: FutureMatch[];
}