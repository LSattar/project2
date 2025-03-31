package com.skillstorm.taxtracker.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.skillstorm.taxtracker.dtos.EmploymentSectorDTO;
import com.skillstorm.taxtracker.models.EmploymentSector;
import com.skillstorm.taxtracker.services.EmploymentSectorService;


@RestController
@RequestMapping("/employment-sector")
public class EmploymentSectorController {

	private EmploymentSectorService service;

	public EmploymentSectorController(EmploymentSectorService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<Iterable<EmploymentSector>> findAll(@RequestParam(required = false) String startsWith) {
		return service.findAll(startsWith);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<EmploymentSector> findEmploymentSectorById(@PathVariable int id) {
		return service.findEmploymentSectorById(id);
	}

	@PostMapping
	public ResponseEntity<EmploymentSector> createEmploymentSector(@RequestBody EmploymentSectorDTO dto) {
		return service.createEmploymentSector(dto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<EmploymentSector> udpateEmploymentSector(@PathVariable int id, @RequestBody EmploymentSectorDTO dto) {
		return service.updateEmploymentSector(id, dto);
	}

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable int id) {
    	return service.deleteById(id);
    }

}
