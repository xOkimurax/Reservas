package com.reservas.service;

import com.reservas.dto.UsuarioRequest;
import com.reservas.dto.UsuarioResponse;
import com.reservas.entity.Usuario;
import com.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> obtenerUsuariosAdministrativos() {
        return usuarioRepository.findUsuariosAdministrativos()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public List<UsuarioResponse> obtenerTodosLosUsuarios() {
        return usuarioRepository.findByActivoTrueOrderByNombreAsc()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public List<UsuarioResponse> obtenerUsuariosPorRol(Usuario.Rol rol) {
        return usuarioRepository.findByRolOrderByNombreAsc(rol)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public Optional<UsuarioResponse> obtenerUsuarioPorId(Long id) {
        return usuarioRepository.findById(id)
                .map(this::convertirADTO);
    }

    public Optional<Usuario> obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public UsuarioResponse crearUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setRol(request.getRol());
        usuario.setDepartamento(request.getDepartamento());
        usuario.setActivo(request.getActivo());
        
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return convertirADTO(usuarioGuardado);
    }

    public UsuarioResponse actualizarUsuario(Long id, UsuarioRequest request) {
        return usuarioRepository.findById(id)
                .map(usuario -> {
                    if (!usuario.getEmail().equals(request.getEmail()) && 
                        usuarioRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("El email ya está registrado");
                    }

                    usuario.setNombre(request.getNombre());
                    usuario.setEmail(request.getEmail());
                    usuario.setTelefono(request.getTelefono());
                    usuario.setRol(request.getRol());
                    usuario.setDepartamento(request.getDepartamento());
                    usuario.setActivo(request.getActivo());
                    
                    if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
                    }

                    return convertirADTO(usuarioRepository.save(usuario));
                })
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public void eliminarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    public List<UsuarioResponse> obtenerUsuariosConReservasGestionadas() {
        return usuarioRepository.findUsuariosConReservasGestionadas()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    private UsuarioResponse convertirADTO(Usuario usuario) {
        UsuarioResponse response = new UsuarioResponse(
            usuario.getIdUsuario(),
            usuario.getNombre(),
            usuario.getEmail(),
            usuario.getRol(),
            usuario.getTelefono(),
            usuario.getDepartamento(),
            usuario.getActivo(),
            usuario.getCreatedAt(),
            usuario.getUpdatedAt()
        );

        Integer totalReservas = usuarioRepository.countReservasGestionadasByUsuario(usuario.getIdUsuario());
        response.setTotalReservasGestionadas(totalReservas != null ? totalReservas : 0);

        return response;
    }
}