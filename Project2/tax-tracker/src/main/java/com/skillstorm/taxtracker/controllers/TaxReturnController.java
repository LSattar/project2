package com.skillstorm.taxtracker.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillstorm.taxtracker.dtos.TaxReturnDTO;
import com.skillstorm.taxtracker.models.TaxReturn;
import com.skillstorm.taxtracker.services.TaxReturnService;

@RestController
@RequestMapping("/tax-return")
public class TaxReturnController {

	private TaxReturnService service;

	public TaxReturnController(TaxReturnService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<Iterable<TaxReturn>> findAll(@RequestParam(required = false) Integer year) {
		return service.findAllByYear(year);
	}
	
    @GetMapping("/employment-sector/{sectorId}")
    public ResponseEntity<Iterable<TaxReturn>> findByEmploymentSector(@PathVariable Integer sectorId) {
        return service.findByEmploymentSector(sectorId);
    }
    
    @GetMapping("/cpa/{cpaId}")
    public ResponseEntity<Iterable<TaxReturn>> findByCpa(@PathVariable Integer cpaId) {
        return service.findByCpa(cpaId);
    }
    
    @GetMapping("/client/{clientId}")
    public ResponseEntity<Iterable<TaxReturn>> findByClient(@PathVariable Integer clientId) {
        return service.findByClient(clientId);
    }
    
	@GetMapping("/{id}")
	public ResponseEntity<TaxReturn> findTaxReturnById(@PathVariable int id) {
		return service.findTaxReturnById(id);
	}

	@PostMapping
	public ResponseEntity<TaxReturn> createTaxReturn(@RequestBody TaxReturnDTO dto) {
		return service.createTaxReturn(dto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<TaxReturn> udpateTaxReturn(@PathVariable int id, @RequestBody TaxReturnDTO dto) {
		return service.updateTaxReturn(id, dto);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable int id) {
		return service.deleteById(id);
	}

}
