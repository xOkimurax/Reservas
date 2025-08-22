package com.reservas.dto;

import com.reservas.entity.Usuario;
import jakarta.validation.constraints.*;

public class UsuarioRequest {
    
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;
    
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email válido")
    @Size(max = 150, message = "El email no puede exceder 150 caracteres")
    private String email;
    
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
    
    @NotNull(message = "El rol es obligatorio")
    private Usuario.Rol rol;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;
    
    @Size(max = 100, message = "El departamento no puede exceder 100 caracteres")
    private String departamento;
    
    private Boolean activo = true;

    public UsuarioRequest() {}

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Usuario.Rol getRol() { return rol; }
    public void setRol(Usuario.Rol rol) { this.rol = rol; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}