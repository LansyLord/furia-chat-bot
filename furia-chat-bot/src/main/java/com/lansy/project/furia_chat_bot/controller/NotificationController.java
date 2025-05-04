package com.lansy.project.furia_chat_bot.controller;

import com.lansy.project.furia_chat_bot.model.EmailRequest;
import com.lansy.project.furia_chat_bot.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/notificacoes/proxima-partida")
    public ResponseEntity<Void> cadastrarEmail(@RequestBody EmailRequest request) {
        notificationService.cadastrarEmailParaNotificacao(request.getEmail());
        return ResponseEntity.ok().build();
    }


    @PostMapping("/notificacoes/descadastrar")
    public ResponseEntity<String> descadastrarEmail(@RequestBody EmailRequest request) {
        boolean removed = notificationService.descadastrarEmail(request.getEmail());
        return removed
                ? ResponseEntity.ok("E-mail removido com sucesso.")
                : ResponseEntity.status(404).body("E-mail não encontrado.");
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = notificationService.emailJaCadastrado(email);
        return ResponseEntity.ok(exists);
    }

}
