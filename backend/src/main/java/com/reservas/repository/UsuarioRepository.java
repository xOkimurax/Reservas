package com.reservas.repository;

import com.reservas.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Usuario> findByActivoTrueOrderByNombreAsc();
    
    List<Usuario> findByRolOrderByNombreAsc(Usuario.Rol rol);
    
    List<Usuario> findByActivoTrueAndRolNotOrderByNombreAsc(Usuario.Rol rol);
    
    @Query("SELECT u FROM Usuario u WHERE u.activo = true AND u.rol IN ('ADMINISTRADOR', 'EMPLEADO', 'SUPERVISOR') ORDER BY u.nombre ASC")
    List<Usuario> findUsuariosAdministrativos();
    
    @Query("SELECT u FROM Usuario u LEFT JOIN u.reservasGestionadas r WHERE u.activo = true AND u.rol != 'CLIENTE' GROUP BY u ORDER BY COUNT(r) DESC")
    List<Usuario> findUsuariosConReservasGestionadas();
    
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.usuarioGestor.idUsuario = :usuarioId")
    Integer countReservasGestionadasByUsuario(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT u FROM Usuario u WHERE u.nombre LIKE %:nombre%")
    List<Usuario> findByNombreContaining(@Param("nombre") String nombre);
    
    @Query("SELECT u FROM Usuario u WHERE u.telefono = :telefono")
    Optional<Usuario> findByTelefono(@Param("telefono") String telefono);
}