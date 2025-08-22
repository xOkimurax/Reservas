package com.reservas.dto;

import com.reservas.entity.Usuario;
import java.time.LocalDateTime;

public class UsuarioResponse {
    private Long idUsuario;
    private String nombre;
    private String email;
    private Usuario.Rol rol;
    private String telefono;
    private String departamento;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer totalReservasGestionadas;

    public UsuarioResponse() {}

    public UsuarioResponse(Long idUsuario, String nombre, String email, Usuario.Rol rol, 
                          String telefono, String departamento, Boolean activo, 
                          LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.telefono = telefono;
        this.departamento = departamento;
        this.activo = activo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Usuario.Rol getRol() { return rol; }
    public void setRol(Usuario.Rol rol) { this.rol = rol; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getTotalReservasGestionadas() { return totalReservasGestionadas; }
    public void setTotalReservasGestionadas(Integer totalReservasGestionadas) { this.totalReservasGestionadas = totalReservasGestionadas; }
}