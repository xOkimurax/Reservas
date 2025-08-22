package com.reservas.repository;

import com.reservas.entity.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicioRepository extends JpaRepository<Servicio, Long> {
    
    List<Servicio> findByActivoTrue();
    
    List<Servicio> findByNombreServicioContainingIgnoreCase(String nombre);
    
    @Query("SELECT s FROM Servicio s WHERE s.activo = true ORDER BY s.nombreServicio ASC")
    List<Servicio> findAllActiveOrderByName();
    
    @Query("SELECT COUNT(r) as count, s.nombreServicio FROM Servicio s " +
           "LEFT JOIN s.reservas r GROUP BY s.idServicio, s.nombreServicio " +
           "ORDER BY count DESC")
    List<Object[]> findServiceUsageStats();
}