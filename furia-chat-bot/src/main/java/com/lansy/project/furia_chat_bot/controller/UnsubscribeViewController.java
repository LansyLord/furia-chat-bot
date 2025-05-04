package com.lansy.project.furia_chat_bot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class UnsubscribeViewController {

    @GetMapping("/unsubscribe")
    public String showUnsubscribePage(@RequestParam String email, Model model) {
        model.addAttribute("email", email); // Passa o e-mail para o template
        return "unsubscribe"; // Nome do arquivo HTML (sem extensão)
    }
}
