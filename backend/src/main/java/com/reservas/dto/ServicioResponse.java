package com.reservas.dto;

import java.time.LocalDateTime;

public class ServicioResponse {
    private Long idServicio;
    private String nombreServicio;
    private Integer precio;
    private String descripcion;
    private Integer duracionMinutos;
    private Boolean activo;
    private LocalDateTime createdAt;

    public ServicioResponse() {}

    public ServicioResponse(Long idServicio, String nombreServicio, Integer precio, 
                           String descripcion, Integer duracionMinutos, Boolean activo, 
                           LocalDateTime createdAt) {
        this.idServicio = idServicio;
        this.nombreServicio = nombreServicio;
        this.precio = precio;
        this.descripcion = descripcion;
        this.duracionMinutos = duracionMinutos;
        this.activo = activo;
        this.createdAt = createdAt;
    }

    // Getters y Setters
    public Long getIdServicio() { return idServicio; }
    public void setIdServicio(Long idServicio) { this.idServicio = idServicio; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}