package com.skillstorm.taxtracker.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillstorm.taxtracker.dtos.ClientDTO;
import com.skillstorm.taxtracker.models.Client;
import com.skillstorm.taxtracker.services.ClientService;

@RestController
@RequestMapping("/client")
public class ClientController {

	private ClientService service;

	public ClientController(ClientService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<Iterable<Client>> findAll(@RequestParam(required = false) String startsWith) {
		return service.findAll(startsWith);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Client> findClientById(@PathVariable int id) {
		return service.findClientById(id);
	}
	
	@GetMapping("by-ssn/{ssn}")
	public ResponseEntity<Client> getClientBySSN(@PathVariable String ssn) {
	    return service.findBySsn(ssn);
	}


	@PostMapping
	public ResponseEntity<Client> createClient(@RequestBody ClientDTO dto) {
		return service.createClient(dto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Client> udpateClient(@PathVariable int id, @RequestBody ClientDTO dto) {
		return service.updateClient(id, dto);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable int id) {
		return service.deleteById(id);
	}
	
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Client> deactivateClient(@PathVariable int id) {
        return service.deactivateClient(id);
    }
	
    @PutMapping("/{ssn}/reactivate")
    public ResponseEntity<Client> reactivateClient(@PathVariable String ssn, @RequestBody ClientDTO dto) {
        return service.reactivateClient(ssn, dto);
    }

}
