package com.reservas.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

public class ReservaRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;
    
    @Email(message = "Debe ser un email válido")
    @NotBlank(message = "El email es obligatorio")
    private String email;
    
    @NotNull(message = "El servicio es obligatorio")
    private Long idServicio;
    
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
    
    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;
    
    private String observaciones;

    public ReservaRequest() {}

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getIdServicio() { return idServicio; }
    public void setIdServicio(Long idServicio) { this.idServicio = idServicio; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}