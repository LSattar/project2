package com.skillstorm.taxtracker.services;

import java.net.URI;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import com.skillstorm.taxtracker.repositories.CpaRepository;
import com.skillstorm.taxtracker.dtos.CpaDTO;
import com.skillstorm.taxtracker.models.Cpa;

@Service
public class CpaService {

	@Value("${base-url}")
	private String baseURL;

	private CpaRepository repo;

	public CpaService(CpaRepository repo) {
		this.repo = repo;
	}

	// Find CPA's by last name (optional)
	public ResponseEntity<Iterable<Cpa>> findAll(String startsWith) {

		Iterable<Cpa> cpas;

		try {
			if (startsWith == null)
				cpas = repo.findAll();
			else
				cpas = repo.findByLastNameStartingWith(startsWith);

			if (!cpas.iterator().hasNext())
				return ResponseEntity.noContent().build();
			else
				return ResponseEntity.ok(cpas);
			
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}
	
	// Find Cpa by ID
    public ResponseEntity<Cpa> findCpaById(int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

	// Create CPA
	public ResponseEntity<Cpa> createCpa(CpaDTO dto) {
		try {
			Cpa saved = repo.save(new Cpa(0, dto.firstName(), dto.lastName(), dto.license(),dto.phone(),
					dto.address1(), dto.address2(), dto.city(), dto.state(), dto.zip()));
			return ResponseEntity.created(new URI(this.baseURL + "cpa/" + saved.getId())).body(saved);
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

	// Update CPA
	public ResponseEntity<Cpa> updateCpa(int id, CpaDTO dto) {
		try {
			if (repo.existsById(id))
				return ResponseEntity.ok(repo.save(new Cpa(id, dto.firstName(), dto.lastName(), dto.license(),dto.phone(),
						dto.address1(), dto.address2(), dto.city(), dto.state(), dto.zip())));
			return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

	// Delete CPA
	public ResponseEntity<Void> deleteById(int id) {
		try {
			if (repo.existsById(id)) {
				repo.deleteById(id);
				return ResponseEntity.noContent().build();
			}
			else
				return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

}
