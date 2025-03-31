package com.skillstorm.taxtracker.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillstorm.taxtracker.dtos.CpaDTO;
import com.skillstorm.taxtracker.models.Cpa;
import com.skillstorm.taxtracker.services.CpaService;

@RestController
@RequestMapping("/cpa")
public class CpaController {

	private CpaService service;

	public CpaController(CpaService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<Iterable<Cpa>> findAll(@RequestParam(required = false) String startsWith) {
		return service.findAll(startsWith);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Cpa> findCpaById(@PathVariable int id) {
		return service.findCpaById(id);
	}

	@PostMapping
	public ResponseEntity<Cpa> createCpa(@RequestBody CpaDTO dto) {
		return service.createCpa(dto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Cpa> udpateCpa(@PathVariable int id, @RequestBody CpaDTO dto) {
		return service.updateCpa(id, dto);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable int id) {
		return service.deleteById(id);
	}

}
