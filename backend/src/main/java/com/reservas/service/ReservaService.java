package com.reservas.service;

import com.reservas.dto.ReservaRequest;
import com.reservas.dto.ReservaResponse;
import com.reservas.entity.Reserva;
import com.reservas.entity.Servicio;
import com.reservas.entity.Usuario;
import com.reservas.repository.ReservaRepository;
import com.reservas.repository.ServicioRepository;
import com.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReservaService {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public ReservaResponse crearReserva(ReservaRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseGet(() -> {
                    Usuario nuevoUsuario = new Usuario();
                    nuevoUsuario.setNombre(request.getNombre());
                    nuevoUsuario.setTelefono(request.getTelefono());
                    nuevoUsuario.setEmail(request.getEmail());
                    nuevoUsuario.setRol(Usuario.Rol.CLIENTE);
                    return usuarioRepository.save(nuevoUsuario);
                });

        Servicio servicio = servicioRepository.findById(request.getIdServicio())
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setServicio(servicio);
        reserva.setFecha(request.getFecha());
        reserva.setHora(request.getHora());
        reserva.setObservaciones(request.getObservaciones());
        reserva.setEstado("Pendiente");

        Reserva reservaGuardada = reservaRepository.save(reserva);
        return new ReservaResponse(reservaGuardada);
    }

    public List<ReservaResponse> obtenerTodasLasReservas() {
        return reservaRepository.findAllOrderByFechaDesc()
                .stream()
                .map(ReservaResponse::new)
                .collect(Collectors.toList());
    }

    public List<ReservaResponse> obtenerReservasPorEstado(String estado) {
        return reservaRepository.findByEstado(estado)
                .stream()
                .map(ReservaResponse::new)
                .collect(Collectors.toList());
    }

    public List<ReservaResponse> obtenerReservasPorFecha(LocalDate fecha) {
        return reservaRepository.findByFecha(fecha)
                .stream()
                .map(ReservaResponse::new)
                .collect(Collectors.toList());
    }

    public ReservaResponse actualizarEstadoReserva(Long id, String nuevoEstado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        
        reserva.setEstado(nuevoEstado);
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return new ReservaResponse(reservaActualizada);
    }

    public ReservaResponse actualizarEstadoReservaConGestor(Long id, String nuevoEstado, String emailGestor) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        
        if (emailGestor != null) {
            Usuario usuarioGestor = usuarioRepository.findByEmail(emailGestor)
                    .orElseThrow(() -> new RuntimeException("Usuario gestor no encontrado"));
            reserva.setUsuarioGestor(usuarioGestor);
        }
        
        reserva.setEstado(nuevoEstado);
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return new ReservaResponse(reservaActualizada);
    }

    public ReservaResponse confirmarReserva(Long id) {
        return actualizarEstadoReserva(id, "Confirmada");
    }

    public ReservaResponse confirmarReserva(Long id, String emailGestor) {
        return actualizarEstadoReservaConGestor(id, "Confirmada", emailGestor);
    }

    public ReservaResponse rechazarReserva(Long id) {
        return actualizarEstadoReserva(id, "Rechazada");
    }

    public ReservaResponse rechazarReserva(Long id, String emailGestor) {
        return actualizarEstadoReservaConGestor(id, "Rechazada", emailGestor);
    }

    public String generarLinkWhatsApp(Long idReserva) {
        Reserva reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        String mensaje = String.format(
            "Hola %s! Tu reserva de %s el %s a las %s fue %s ✅",
            reserva.getUsuario().getNombre(),
            reserva.getServicio().getNombreServicio(),
            reserva.getFecha(),
            reserva.getHora(),
            reserva.getEstado().toUpperCase()
        );

        try {
            String mensajeCodificado = URLEncoder.encode(mensaje, StandardCharsets.UTF_8.toString());
            return "https://wa.me/" + reserva.getUsuario().getTelefono() + "?text=" + mensajeCodificado;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Error al generar link de WhatsApp", e);
        }
    }

    public Optional<ReservaResponse> obtenerReservaPorId(Long id) {
        return reservaRepository.findById(id)
                .map(ReservaResponse::new);
    }
}