package com.lansy.project.furia_chat_bot.model;

public class MensagemResponse<T> {
    private T resposta;

    public MensagemResponse(T resposta) {
        this.resposta = resposta;
    }

    public T getResposta() {
        return resposta;
    }

    public void setResposta(T resposta) {
        this.resposta = resposta;
    }
}

