package com.skillstorm.taxtracker.controllers;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.skillstorm.taxtracker.dtos.PaymentDTO;
import com.skillstorm.taxtracker.models.Payment;
import com.skillstorm.taxtracker.services.PaymentService;

@RestController
@RequestMapping("/payment")
public class PaymentController {

	private PaymentService service;

	public PaymentController(PaymentService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<Iterable<Payment>> findAll(@RequestParam(required = false) String startsWith) {
		return service.findAll(startsWith);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<Payment> findPaymentById(@PathVariable int id) {
		return service.findPaymentById(id);
	}

	@PostMapping
	public ResponseEntity<Payment> createPayment(@RequestBody PaymentDTO dto) {
		return service.createPayment(dto);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Payment> udpatePayment(@PathVariable int id, @RequestBody PaymentDTO dto) {
		return service.updatePayment(id, dto);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteById(@PathVariable int id) {
		return service.deleteById(id);
	}
	
	@GetMapping("/tax-return/{taxReturnId}/balance")
	public ResponseEntity<BigDecimal> getTaxReturnBalance(@PathVariable int taxReturnId) {
	    return service.getTaxReturnBalance(taxReturnId);
	}
	
	@GetMapping("/client/{clientId}/balance")
	public ResponseEntity<BigDecimal> getClientBalance(@PathVariable int clientId) {
	    return service.getClientBalance(clientId);
	}



}
