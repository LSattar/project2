package com.skillstorm.taxtracker.services;

import java.net.URI;
import org.springframework.beans.factory.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;

import com.skillstorm.taxtracker.repositories.ClientRepository;
import com.skillstorm.taxtracker.repositories.EmploymentSectorRepository;

import jakarta.persistence.EntityNotFoundException;

import com.skillstorm.taxtracker.dtos.EmploymentSectorDTO;
import com.skillstorm.taxtracker.models.EmploymentSector;

@Service
public class EmploymentSectorService {

	@Value("${base-url}")
	private String baseURL;

	private EmploymentSectorRepository repo;
	private ClientRepository clientRepo;

	public EmploymentSectorService(EmploymentSectorRepository repo, ClientRepository clientRepo) {
		this.repo = repo;
		this.clientRepo = clientRepo;
	}

	// Find employment sectors by sector name (optional)
	public ResponseEntity<Iterable<EmploymentSector>> findAll(String startsWith) {

		Iterable<EmploymentSector> sectors;

		try {
			if (startsWith == null)
				sectors = repo.findAll();
			else
				sectors = repo.findByEmploymentSectorNameStartingWith(startsWith);

			if (!sectors.iterator().hasNext())
				return ResponseEntity.noContent().build();
			else
				return ResponseEntity.ok(sectors);

		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}
	
	// Find employment sectors by ID
    public ResponseEntity<EmploymentSector> findEmploymentSectorById(int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

	// Create employment sector
	public ResponseEntity<EmploymentSector> createEmploymentSector(EmploymentSectorDTO dto) {
	    try {
	        EmploymentSector saved = repo.save(new EmploymentSector(0, dto.employmentSectorName()));
	        return ResponseEntity.created(new URI(this.baseURL + "employment-sector/" + saved.getId())).body(saved);

	    } catch (DataIntegrityViolationException e) {
	        // Duplicate employmentSectorName detected
	        return ResponseEntity.status(HttpStatus.CONFLICT).body(null);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    }
	}

	// Update employment sector
	public ResponseEntity<EmploymentSector> updateEmploymentSector(int id, EmploymentSectorDTO dto) {
	    try {
	        if (!repo.existsById(id)) {
	            return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
	        }

	        EmploymentSector updated = repo.save(new EmploymentSector(id, dto.employmentSectorName()));
	        return ResponseEntity.ok(updated);

	    } catch (DataIntegrityViolationException e) {
	        // Duplicate employmentSectorName detected
	        return ResponseEntity.status(HttpStatus.CONFLICT).body(null);

	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    }
	}

	// Delete employment sector
	public ResponseEntity<Void> deleteById(int id) {
		try {
			if (!repo.existsById(id)) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
			}
			if (clientRepo.existsByEmploymentSectorId(id)) {
				return ResponseEntity.status(HttpStatus.CONFLICT).build();
			} else {
				repo.deleteById(id);
				return ResponseEntity.noContent().build();
			}

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

}
