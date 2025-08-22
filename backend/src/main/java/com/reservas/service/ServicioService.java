package com.reservas.service;

import com.reservas.dto.ServicioRequest;
import com.reservas.dto.ServicioResponse;
import com.reservas.entity.Servicio;
import com.reservas.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServicioService {

    @Autowired
    private ServicioRepository servicioRepository;

    public List<ServicioResponse> obtenerServiciosActivos() {
        return servicioRepository.findAllActiveOrderByName()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public List<ServicioResponse> obtenerTodosLosServicios() {
        return servicioRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public Optional<ServicioResponse> obtenerServicioPorId(Long id) {
        return servicioRepository.findById(id)
                .map(this::convertirADTO);
    }

    public ServicioResponse crearServicio(ServicioRequest request) {
        Servicio servicio = new Servicio();
        servicio.setNombreServicio(request.getNombreServicio());
        servicio.setPrecio(request.getPrecio());
        servicio.setDescripcion(request.getDescripcion());
        servicio.setDuracionMinutos(request.getDuracionMinutos());
        servicio.setActivo(request.getActivo());
        
        Servicio servicioGuardado = servicioRepository.save(servicio);
        return convertirADTO(servicioGuardado);
    }

    public ServicioResponse actualizarServicio(Long id, ServicioRequest request) {
        return servicioRepository.findById(id)
                .map(servicio -> {
                    servicio.setNombreServicio(request.getNombreServicio());
                    servicio.setPrecio(request.getPrecio());
                    servicio.setDescripcion(request.getDescripcion());
                    servicio.setDuracionMinutos(request.getDuracionMinutos());
                    servicio.setActivo(request.getActivo());
                    return convertirADTO(servicioRepository.save(servicio));
                })
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));
    }

    private ServicioResponse convertirADTO(Servicio servicio) {
        return new ServicioResponse(
            servicio.getIdServicio(),
            servicio.getNombreServicio(),
            servicio.getPrecio(),
            servicio.getDescripcion(),
            servicio.getDuracionMinutos(),
            servicio.getActivo(),
            servicio.getCreatedAt()
        );
    }

    public void eliminarServicio(Long id) {
        servicioRepository.deleteById(id);
    }
}