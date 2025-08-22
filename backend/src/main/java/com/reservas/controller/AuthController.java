package com.reservas.controller;

import com.reservas.dto.LoginRequest;
import com.reservas.dto.LoginResponse;
import com.reservas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Credenciales inválidas"));
        }
    }
    
    public static class ErrorResponse {
        private String message;
        
        public ErrorResponse(String message) {
            this.message = message;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader("Authorization") String token) {
        try {
            String actualToken = token.replace("Bearer ", "");
            boolean isValid = authService.validarToken(actualToken);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }
}