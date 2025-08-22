package com.reservas.dto;

import com.reservas.entity.Reserva;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReservaResponse {
    private Long idReserva;
    private String nombreCliente;
    private String telefonoCliente;
    private String emailCliente;
    private String nombreServicio;
    private LocalDate fecha;
    private LocalTime hora;
    private String estado;
    private String observaciones;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
    private UsuarioGestorResponse usuarioGestor;

    public ReservaResponse() {}

    public ReservaResponse(Reserva reserva) {
        this.idReserva = reserva.getIdReserva();
        this.nombreCliente = reserva.getUsuario().getNombre();
        this.telefonoCliente = reserva.getUsuario().getTelefono();
        this.emailCliente = reserva.getUsuario().getEmail();
        this.nombreServicio = reserva.getServicio().getNombreServicio();
        this.fecha = reserva.getFecha();
        this.hora = reserva.getHora();
        this.estado = reserva.getEstado();
        this.observaciones = reserva.getObservaciones();
        this.creadoEn = reserva.getCreadoEn();
        this.actualizadoEn = reserva.getActualizadoEn();
        
        if (reserva.getUsuarioGestor() != null) {
            this.usuarioGestor = new UsuarioGestorResponse(
                reserva.getUsuarioGestor().getIdUsuario(),
                reserva.getUsuarioGestor().getNombre(),
                reserva.getUsuarioGestor().getEmail(),
                reserva.getUsuarioGestor().getRol().getDisplayName()
            );
        }
    }

    public static class UsuarioGestorResponse {
        private Long idUsuario;
        private String nombre;
        private String email;
        private String rol;

        public UsuarioGestorResponse() {}

        public UsuarioGestorResponse(Long idUsuario, String nombre, String email, String rol) {
            this.idUsuario = idUsuario;
            this.nombre = nombre;
            this.email = email;
            this.rol = rol;
        }

        // Getters y Setters
        public Long getIdUsuario() { return idUsuario; }
        public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRol() { return rol; }
        public void setRol(String rol) { this.rol = rol; }
    }

    // Getters y Setters
    public Long getIdReserva() { return idReserva; }
    public void setIdReserva(Long idReserva) { this.idReserva = idReserva; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public String getEmailCliente() { return emailCliente; }
    public void setEmailCliente(String emailCliente) { this.emailCliente = emailCliente; }

    public String getNombreServicio() { return nombreServicio; }
    public void setNombreServicio(String nombreServicio) { this.nombreServicio = nombreServicio; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }

    public UsuarioGestorResponse getUsuarioGestor() { return usuarioGestor; }
    public void setUsuarioGestor(UsuarioGestorResponse usuarioGestor) { this.usuarioGestor = usuarioGestor; }
}