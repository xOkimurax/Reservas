package com.reservas.repository;

import com.reservas.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    
    List<Reserva> findByEstado(String estado);
    
    List<Reserva> findByFecha(LocalDate fecha);
    
    List<Reserva> findByFechaBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<Reserva> findByUsuario_IdUsuario(Long idUsuario);
    
    List<Reserva> findByServicio_IdServicio(Long idServicio);
    
    @Query("SELECT r FROM Reserva r WHERE r.fecha = :fecha AND r.estado = :estado")
    List<Reserva> findByFechaAndEstado(@Param("fecha") LocalDate fecha, @Param("estado") String estado);
    
    @Query("SELECT r FROM Reserva r ORDER BY r.fecha DESC, r.hora DESC")
    List<Reserva> findAllOrderByFechaDesc();
    
    @Query("SELECT r FROM Reserva r WHERE r.estado = 'Pendiente' ORDER BY r.creadoEn ASC")
    List<Reserva> findPendingReservationsOrderByCreated();
    
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.fecha = :fecha AND r.estado IN ('Confirmada', 'Pendiente')")
    Long countReservationsByDate(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT COUNT(r) as count, EXTRACT(MONTH FROM r.fecha) as month " +
           "FROM Reserva r WHERE r.estado = 'Confirmada' AND EXTRACT(YEAR FROM r.fecha) = :year " +
           "GROUP BY EXTRACT(MONTH FROM r.fecha) ORDER BY month")
    List<Object[]> findMonthlyReservationStats(@Param("year") int year);
}