package com.reservas.service;

import com.reservas.dto.LoginRequest;
import com.reservas.dto.LoginResponse;
import com.reservas.entity.Usuario;
import com.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest loginRequest) {
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!Usuario.Rol.ADMINISTRADOR.equals(usuario.getRol()) && 
            !Usuario.Rol.SUPERVISOR.equals(usuario.getRol()) && 
            !Usuario.Rol.EMPLEADO.equals(usuario.getRol())) {
            throw new RuntimeException("No tienes permisos de administrador");
        }

        // Por simplicidad, retornamos un token simple (en producción usar JWT)
        String token = "admin-token-" + System.currentTimeMillis();

        return new LoginResponse(token, usuario.getNombre(), usuario.getEmail(), usuario.getRol().getDisplayName());
    }

    public boolean validarToken(String token) {
        return token != null && token.startsWith("admin-token-");
    }
}