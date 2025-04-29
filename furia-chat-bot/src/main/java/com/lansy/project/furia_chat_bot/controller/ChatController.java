package com.lansy.project.furia_chat_bot.controller;

import com.lansy.project.furia_chat_bot.model.MensagemRequest;
import com.lansy.project.furia_chat_bot.model.MensagemResponse;
import com.lansy.project.furia_chat_bot.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/mensagem")
    public ResponseEntity<MensagemResponse<?>> receberMensagem(@RequestBody MensagemRequest mensagemRequest) {
        return ResponseEntity.ok(chatService.processarMensagem(mensagemRequest));
    }
}