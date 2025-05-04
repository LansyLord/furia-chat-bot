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

    // Verifica a cada 2 horas
    @Scheduled(fixedRate = 720000)
    public void verificarPartidasAgendadas() {
        notificationService.verificarEEnviarNotificacoes();
    }

    @Scheduled(fixedRate = 10800000) // Limpa e-mails expirados a cada 3 horas
    public void limparEmailsExpirados() {
        notificationService.removerEmailsExpirados();
    }
}
