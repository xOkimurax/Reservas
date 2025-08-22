package com.reservas.dto;

import jakarta.validation.constraints.*;

public class ServicioRequest {
    
    @NotBlank(message = "El nombre del servicio es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombreServicio;
    
    @NotNull(message = "El precio es obligatorio")
    @PositiveOrZero(message = "El precio debe ser positivo o cero")
    private Integer precio;
    
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;
    
    @NotNull(message = "La duración es obligatoria")
    @Min(value = 1, message = "La duración debe ser al menos 1 minuto")
    @Max(value = 480, message = "La duración no puede exceder 8 horas")
    private Integer duracionMinutos;
    
    private Boolean activo = true;

    public ServicioRequest() {}

    // Getters y Setters
    public String getNombreServicio() { return nombreServicio; }
    public void setNombreServicio(String nombreServicio) { this.nombreServicio = nombreServicio; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}