package com.skillstorm.taxtracker.configs;

import java.util.Arrays;
import java.util.LinkedList;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
public class SecurityConfig {

	 @Bean
	    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
	        http
	            .httpBasic(Customizer.withDefaults())

	            .csrf().disable()

	            .cors(cors -> cors.configurationSource(request -> {
	                CorsConfiguration cc = new CorsConfiguration().applyPermitDefaultValues();
	                cc.setAllowedMethods(new LinkedList<>(Arrays.asList("GET", "POST", "PUT", "DELETE")));
	                return cc;
	            }))

	            .authorizeHttpRequests(auth -> auth
	                .requestMatchers(HttpMethod.GET, "/**").permitAll()
	                .anyRequest().permitAll()
	            )

	            .formLogin().disable()
	            .httpBasic().disable();

	        return http.build();
	    }
}
