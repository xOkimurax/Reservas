package com.reservas.controller;

import com.reservas.dto.ServicioRequest;
import com.reservas.dto.ServicioResponse;
import com.reservas.service.ServicioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ServicioController {

    @Autowired
    private ServicioService servicioService;

    @GetMapping
    public ResponseEntity<List<ServicioResponse>> obtenerServicios(
            @RequestParam(defaultValue = "true") boolean soloActivos) {
        
        List<ServicioResponse> servicios = soloActivos ? 
            servicioService.obtenerServiciosActivos() : 
            servicioService.obtenerTodosLosServicios();
            
        return ResponseEntity.ok(servicios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServicioResponse> obtenerServicioPorId(@PathVariable Long id) {
        return servicioService.obtenerServicioPorId(id)
                .map(servicio -> ResponseEntity.ok(servicio))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crearServicio(@Valid @RequestBody ServicioRequest request) {
        try {
            ServicioResponse nuevoServicio = servicioService.crearServicio(request);
            return ResponseEntity.ok(nuevoServicio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al crear el servicio: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarServicio(@PathVariable Long id, @Valid @RequestBody ServicioRequest request) {
        try {
            ServicioResponse servicioActualizado = servicioService.actualizarServicio(id, request);
            return ResponseEntity.ok(servicioActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al actualizar el servicio: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarServicio(@PathVariable Long id) {
        try {
            servicioService.eliminarServicio(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}