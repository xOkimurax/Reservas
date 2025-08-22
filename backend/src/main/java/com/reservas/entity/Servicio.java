package com.reservas.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "servicios")
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Long idServicio;

    @NotBlank(message = "El nombre del servicio es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    @Column(name = "nombre_servicio", nullable = false)
    private String nombreServicio;

    @PositiveOrZero(message = "El precio debe ser positivo o cero")
    @Column(name = "precio")
    private Integer precio;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "duracion_minutos")
    private Integer duracionMinutos = 60;

    @Column(name = "activo")
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "servicio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reserva> reservas;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Servicio() {}

    public Servicio(String nombreServicio, Integer precio, String descripcion) {
        this.nombreServicio = nombreServicio;
        this.precio = precio;
        this.descripcion = descripcion;
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

    public List<Reserva> getReservas() { return reservas; }
    public void setReservas(List<Reserva> reservas) { this.reservas = reservas; }
}