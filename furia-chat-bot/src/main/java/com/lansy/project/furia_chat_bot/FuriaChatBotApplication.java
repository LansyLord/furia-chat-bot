package com.lansy.project.furia_chat_bot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FuriaChatBotApplication {

	public static void main(String[] args) {
		SpringApplication.run(FuriaChatBotApplication.class, args);
	}

}
