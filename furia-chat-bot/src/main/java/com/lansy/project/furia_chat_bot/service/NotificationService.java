package com.lansy.project.furia_chat_bot.service;

import com.lansy.project.furia_chat_bot.dto.MatchDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private final Set<String> emailsInscritos = new HashSet<>();
    private final Map<Integer, Set<String>> partidasNotificadas = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> emailRegistrationTimes = new ConcurrentHashMap<>();
    private Integer ultimaPartidaNotificadaId = null;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ChatService chatService;

    public void cadastrarEmailParaNotificacao(String email) {
        if (emailsInscritos.add(email)) { // Só continua se o email era novo
            notificarEmailRecemCadastrado(email);
        }
    }

    public void removerEmailsExpirados() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(3);

        emailRegistrationTimes.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(cutoffTime)) {
                emailsInscritos.remove(entry.getKey());
                return true;
            }
            return false;
        });
    }

// Descadastramento manual via endpoint
    public boolean descadastrarEmail(String email) {
        boolean removed = emailsInscritos.remove(email);
        if (removed) {
            emailRegistrationTimes.remove(email);
        }
        System.out.println("Email " + email + " removido com sucesso!" );
        return removed;
    }

    public boolean emailJaCadastrado(String email) {
        return emailsInscritos.contains(email.toLowerCase());
    }

    private void notificarEmailRecemCadastrado(String novoEmail) {
        List<MatchDTO> proximosJogos = chatService.buscarProximosJogos();

        if (!proximosJogos.isEmpty()) {
            MatchDTO proximaPartida = proximosJogos.get(0);

            // Verifica se esta partida já foi notificada antes
            if (ultimaPartidaNotificadaId != null &&
                    ultimaPartidaNotificadaId.equals(proximaPartida.getId())) {

                // Verifica se este email já recebeu esta partida
                Set<String> emailsNotificados = partidasNotificadas.get(proximaPartida.getId());
                if (emailsNotificados != null && emailsNotificados.contains(novoEmail)) {
                    return; // Email já recebeu esta partida
                }
            }

            // Envia notificação para o novo email
            enviarNotificacaoPartida(proximaPartida, novoEmail);

            // Atualiza os registros
            partidasNotificadas.computeIfAbsent(proximaPartida.getId(), k -> new HashSet<>())
                    .add(novoEmail);
            ultimaPartidaNotificadaId = proximaPartida.getId();
        }
    }

    public void verificarEEnviarNotificacoes() {
        List<MatchDTO> proximosJogos = chatService.buscarProximosJogos();

        if (!proximosJogos.isEmpty()) {
            MatchDTO proximaPartida = proximosJogos.get(0);

            // Verifica se é uma partida nova
            if (ultimaPartidaNotificadaId == null ||
                    !ultimaPartidaNotificadaId.equals(proximaPartida.getId())) {

                // Notifica todos os emails inscritos
                notificarTodosSobreNovaPartida(proximaPartida);

                // Atualiza o registro
                ultimaPartidaNotificadaId = proximaPartida.getId();
            }
        }
    }

    public void notificarTodosSobreNovaPartida(MatchDTO partida) {
        Set<String> emailsNotificados = new HashSet<>();

        String adversario = partida.getTeams().stream()
                .filter(team -> !"FURIA".equalsIgnoreCase(team.getName()))
                .findFirst()
                .map(MatchDTO.TeamDTO::getName)
                .orElse("Time desconhecido");

        String assunto = "⚡ FURIA vs " + adversario + " - " + partida.getLeagueName() + " 🎮";

        String mensagem = String.format(
                "🏆 %s - %s\n\n" +
                        "🔥 FURIA vs %s 🔥\n\n" +
                        "📅 Data: %s\n" +  // Aqui será usada a data formatada
                        "🎥 Transmissão: %s\n\n" +
                        "⏰ Não perca este jogo eletrizante! ⏰\n\n" +
                        "📢 Acompanhe a FURIA nesta batalha épica pelo %s!\n\n" +
                        "💛🖤 #GoFURIA 💛🖤\n\n" +
                        "🔔 Você está recebendo esta notificação porque se inscreveu no FURIA Chat Bot.",
                partida.getLeagueName(),
                partida.getSeriesName(),
                adversario,
                formatarData(partida.getMatchDate()),  // Data formatada aqui
                partida.getStreamUrl() != null ? partida.getStreamUrl() : "Link em breve",
                partida.getLeagueName()
        );
        // Envia para todos os emails inscritos
        emailsInscritos.forEach(email -> {
            enviarEmail(email, assunto, mensagem);
            emailsNotificados.add(email);
        });

        // Armazena quais emails foram notificados
        partidasNotificadas.put(partida.getId(), emailsNotificados);
    }

    private void enviarNotificacaoPartida(MatchDTO partida, String email) {
        String adversario = partida.getTeams().stream()
                .filter(team -> !"FURIA".equalsIgnoreCase(team.getName()))
                .findFirst()
                .map(MatchDTO.TeamDTO::getName)
                .orElse("Time desconhecido");

        String assunto = "⚡ FURIA vs " + adversario + " - " + partida.getLeagueName() + " 🎮";

        String mensagem = String.format(
                "🏆 %s - %s\n\n" +
                        "🔥 FURIA vs %s 🔥\n\n" +
                        "📅 Data: %s\n" +  // Aqui será usada a data formatada
                        "🎥 Transmissão: %s\n\n" +
                        "⏰ Não perca este jogo eletrizante! ⏰\n\n" +
                        "📢 Acompanhe a FURIA nesta batalha épica pelo %s!\n\n" +
                        "💛🖤 #GoFURIA 💛🖤\n\n" +
                        "🔔 Você está recebendo esta notificação porque se inscreveu no FURIA Chat Bot.",
                partida.getLeagueName(),
                partida.getSeriesName(),
                adversario,
                formatarData(partida.getMatchDate()),  // Data formatada aqui
                partida.getStreamUrl() != null ? partida.getStreamUrl() : "Link em breve",
                partida.getLeagueName()
        );

        enviarEmail(email, assunto, mensagem);
    }

    private void enviarEmail(String destinatario, String assunto, String mensagem) {
        try {
            String unsubscribeLink = "http://localhost:8080/unsubscribe?email="
                    + URLEncoder.encode(destinatario, StandardCharsets.UTF_8);

            String mensagemComUnsubscribe = mensagem +
                    "\n\nPara descadastrar, clique aqui: " + unsubscribeLink;

            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom("noreply@furia-notifications.com");
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            email.setText(mensagemComUnsubscribe);

            mailSender.send(email);
            System.out.println("Email enviado para: " + destinatario);
        } catch (Exception e) {
            System.err.println("Erro ao enviar email para " + destinatario + ": " + e.getMessage());
        }
    }

    private String formatarData(String dataOriginal) {
        try {
            ZonedDateTime zonedDateTime = ZonedDateTime.parse(dataOriginal);
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm").withLocale(new Locale("pt", "BR"));
            return zonedDateTime.format(formatter) + " (Horário de Brasília)";
        } catch (Exception e) {
            System.err.println("Erro ao formatar data: " + dataOriginal + " - " + e.getMessage());
            return dataOriginal; // Retorna o original se houver erro
        }
    }

}