package com.reservas.controller;

import com.reservas.repository.ReservaRepository;
import com.reservas.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReportesController {

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen() {
        Map<String, Object> resumen = new HashMap<>();
        
        long totalReservas = reservaRepository.count();
        long reservasPendientes = reservaRepository.findByEstado("Pendiente").size();
        long reservasConfirmadas = reservaRepository.findByEstado("Confirmada").size();
        long reservasRechazadas = reservaRepository.findByEstado("Rechazada").size();
        
        resumen.put("totalReservas", totalReservas);
        resumen.put("reservasPendientes", reservasPendientes);
        resumen.put("reservasConfirmadas", reservasConfirmadas);
        resumen.put("reservasRechazadas", reservasRechazadas);
        resumen.put("reservasHoy", reservaRepository.countReservationsByDate(LocalDate.now()));
        
        return ResponseEntity.ok(resumen);
    }

    @GetMapping("/servicios-populares")
    public ResponseEntity<List<Object[]>> obtenerServiciosPopulares() {
        List<Object[]> stats = servicioRepository.findServiceUsageStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reservas-mensuales")
    public ResponseEntity<List<Object[]>> obtenerReservasMensuales(
            @RequestParam(defaultValue = "2024") int year) {
        List<Object[]> stats = reservaRepository.findMonthlyReservationStats(year);
        return ResponseEntity.ok(stats);
    }
}