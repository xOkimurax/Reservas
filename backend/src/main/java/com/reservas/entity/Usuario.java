package com.reservas.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    @Column(name = "telefono", nullable = false)
    private String telefono;

    @Email(message = "Debe ser un email válido")
    @NotBlank(message = "El email es obligatorio")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    private Rol rol = Rol.CLIENTE;

    @Column(name = "password")
    private String password;

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "departamento", length = 100)
    private String departamento;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reserva> reservas;

    @OneToMany(mappedBy = "usuarioGestor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reserva> reservasGestionadas;

    public enum Rol {
        ADMINISTRADOR("Administrador"),
        EMPLEADO("Empleado"),
        SUPERVISOR("Supervisor"),
        CLIENTE("Cliente");
        
        private final String displayName;
        
        Rol(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }

    public Usuario() {}

    public Usuario(String nombre, String telefono, String email) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.email = email;
    }

    public Usuario(String nombre, String telefono, String email, Rol rol) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.email = email;
        this.rol = rol;
    }

    // Getters y Setters
    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Reserva> getReservas() { return reservas; }
    public void setReservas(List<Reserva> reservas) { this.reservas = reservas; }

    public List<Reserva> getReservasGestionadas() { return reservasGestionadas; }
    public void setReservasGestionadas(List<Reserva> reservasGestionadas) { this.reservasGestionadas = reservasGestionadas; }
}