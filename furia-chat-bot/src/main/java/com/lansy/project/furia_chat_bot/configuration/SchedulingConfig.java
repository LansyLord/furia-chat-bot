package com.lansy.project.furia_chat_bot.configuration;

import com.lansy.project.furia_chat_bot.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    @Autowired
    private NotificationService notificationService;

    // Verifica a cada hora (ajuste conforme necessário)
    @Scheduled(fixedRate = 60000)
    public void verificarPartidasAgendadas() {
        notificationService.verificarEEnviarNotificacoes();
    }
}
