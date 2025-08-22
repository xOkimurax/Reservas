package com.reservas.controller;

import com.reservas.dto.UsuarioRequest;
import com.reservas.dto.UsuarioResponse;
import com.reservas.entity.Usuario;
import com.reservas.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> obtenerUsuarios(
            @RequestParam(defaultValue = "false") boolean soloAdministrativos,
            @RequestParam(required = false) String rol) {
        
        List<UsuarioResponse> usuarios;
        
        if (soloAdministrativos) {
            usuarios = usuarioService.obtenerUsuariosAdministrativos();
        } else if (rol != null) {
            try {
                Usuario.Rol enumRol = Usuario.Rol.valueOf(rol.toUpperCase());
                usuarios = usuarioService.obtenerUsuariosPorRol(enumRol);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            usuarios = usuarioService.obtenerTodosLosUsuarios();
        }
        
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/con-reservas")
    public ResponseEntity<List<UsuarioResponse>> obtenerUsuariosConReservasGestionadas() {
        List<UsuarioResponse> usuarios = usuarioService.obtenerUsuariosConReservasGestionadas();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtenerUsuarioPorId(@PathVariable Long id) {
        return usuarioService.obtenerUsuarioPorId(id)
                .map(usuario -> ResponseEntity.ok(usuario))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        try {
            UsuarioResponse nuevoUsuario = usuarioService.crearUsuario(request);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al crear el usuario: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        try {
            UsuarioResponse usuarioActualizado = usuarioService.actualizarUsuario(id, request);
            return ResponseEntity.ok(usuarioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al actualizar el usuario: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok(Map.of("message", "Usuario desactivado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al eliminar el usuario: " + e.getMessage()));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Map<String, String>>> obtenerRoles() {
        List<Map<String, String>> roles = List.of(
            Map.of("value", "ADMINISTRADOR", "label", "Administrador"),
            Map.of("value", "EMPLEADO", "label", "Empleado"),
            Map.of("value", "SUPERVISOR", "label", "Supervisor"),
            Map.of("value", "CLIENTE", "label", "Cliente")
        );
        return ResponseEntity.ok(roles);
    }
}