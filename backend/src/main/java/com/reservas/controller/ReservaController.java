package com.reservas.controller;

import com.reservas.dto.ReservaRequest;
import com.reservas.dto.ReservaResponse;
import com.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaRequest request) {
        try {
            ReservaResponse reserva = reservaService.crearReserva(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(reserva);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Error al crear la reserva: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ReservaResponse>> obtenerReservas(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        
        List<ReservaResponse> reservas;
        
        if (estado != null) {
            reservas = reservaService.obtenerReservasPorEstado(estado);
        } else if (fecha != null) {
            reservas = reservaService.obtenerReservasPorFecha(fecha);
        } else {
            reservas = reservaService.obtenerTodasLasReservas();
        }
        
        return ResponseEntity.ok(reservas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservaResponse> obtenerReservaPorId(@PathVariable Long id) {
        return reservaService.obtenerReservaPorId(id)
                .map(reserva -> ResponseEntity.ok(reserva))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<ReservaResponse> confirmarReserva(
            @PathVariable Long id,
            @RequestParam(required = false) String emailGestor) {
        try {
            ReservaResponse reserva = emailGestor != null ? 
                reservaService.confirmarReserva(id, emailGestor) : 
                reservaService.confirmarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<ReservaResponse> rechazarReserva(
            @PathVariable Long id,
            @RequestParam(required = false) String emailGestor) {
        try {
            ReservaResponse reserva = emailGestor != null ? 
                reservaService.rechazarReserva(id, emailGestor) : 
                reservaService.rechazarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/whatsapp")
    public ResponseEntity<Map<String, String>> generarLinkWhatsApp(@PathVariable Long id) {
        try {
            String link = reservaService.generarLinkWhatsApp(id);
            return ResponseEntity.ok(Map.of("whatsappLink", link));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}