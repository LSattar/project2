package com.skillstorm.taxtracker.services;

import java.math.BigDecimal;
import java.net.URI;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.web.server.ResponseStatusException;

import com.skillstorm.taxtracker.repositories.ClientRepository;
import com.skillstorm.taxtracker.repositories.PaymentRepository;
import com.skillstorm.taxtracker.repositories.TaxReturnRepository;
import com.skillstorm.taxtracker.dtos.PaymentDTO;
import com.skillstorm.taxtracker.models.Client;
import com.skillstorm.taxtracker.models.Payment;
import com.skillstorm.taxtracker.models.TaxReturn;

@Service
public class PaymentService {

	@Value("${base-url}")
	private String baseURL;

	private PaymentRepository repo;
	private TaxReturnRepository taxReturnRepo;
	private ClientRepository clientRepo;

	public PaymentService(PaymentRepository repo, TaxReturnRepository taxReturnRepo, ClientRepository clientRepo) {
		this.repo = repo;
		this.taxReturnRepo = taxReturnRepo;
		this.clientRepo = clientRepo;
	}

	// Find payments by client last name (optional)
	public ResponseEntity<Iterable<Payment>> findAll(String startsWith) {

		Iterable<Payment> payments;

		try {
			if (startsWith == null)
				payments = repo.findAll();
			else
				payments = repo.findByClientLastName(startsWith);

			if (!payments.iterator().hasNext())
				return ResponseEntity.noContent().build();
			else
				return ResponseEntity.ok(payments);

		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}
	
	// Find payment by ID
    public ResponseEntity<Payment> findPaymentById(int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

	// Create a new payment
	public ResponseEntity<Payment> createPayment(PaymentDTO dto) {
		try {

			TaxReturn taxReturn = taxReturnRepo.findById(dto.taxReturn().getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Tax return not found with ID: " + dto.taxReturn().getId()));

			Payment saved = repo.save(new Payment(0, dto.amount(), dto.date(), dto.taxReturn(), dto.method()));
			return ResponseEntity.created(new URI(this.baseURL + "payment/" + saved.getId())).body(saved);
		}catch (ResponseStatusException e) {
	        return ResponseEntity.status(e.getStatusCode()).body(null);
	    }  catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

	// Update a payment
	public ResponseEntity<Payment> updatePayment(int id, PaymentDTO dto) {
		try {

			if (repo.existsById(id)) {

				TaxReturn taxReturn = taxReturnRepo.findById(dto.taxReturn().getId())
						.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
								"Tax return not found with ID: " + dto.taxReturn().getId()));
				return ResponseEntity
						.ok(repo.save(new Payment(id, dto.amount(), dto.date(), dto.taxReturn(), dto.method())));

			}
			return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
		} catch (ResponseStatusException e) {
	        return ResponseEntity.status(e.getStatusCode()).body(null);
	    } catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}

	// Delete a payment
	public ResponseEntity<Void> deleteById(int id) {
		try {
			if (repo.existsById(id)) {
				repo.deleteById(id);
				return ResponseEntity.noContent().build();
			} else
				return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		} catch (Exception e) {
			return ResponseEntity.status(500).build();
		}
	}
	
	// Get balance for individual tax return
	public ResponseEntity<BigDecimal> getTaxReturnBalance(int taxReturnId) {
	    if (!taxReturnRepo.existsById(taxReturnId)) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	    }

	    return taxReturnRepo.findById(taxReturnId)
	            .map(taxReturn -> {
	                BigDecimal totalPayments = repo.sumPaymentsByTaxReturnId(taxReturnId);
	                if (totalPayments == null) totalPayments = BigDecimal.ZERO;
	                BigDecimal balance = taxReturn.getCost().subtract(totalPayments);
	                return ResponseEntity.ok(balance);
	            })
	            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
	}

	
	//Get balance for client
	public ResponseEntity<BigDecimal> getClientBalance(int clientId) {
	    if (!clientRepo.existsById(clientId)) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	    }

	    Iterable<TaxReturn> taxReturns = taxReturnRepo.findByClientId(clientId);
	    if (!taxReturns.iterator().hasNext()) {
	        return ResponseEntity.ok(BigDecimal.ZERO);
	    }

	    BigDecimal totalBalance = BigDecimal.ZERO;
	    for (TaxReturn taxReturn : taxReturns) {
	        ResponseEntity<BigDecimal> taxReturnBalanceResponse = getTaxReturnBalance(taxReturn.getId());

	        if (taxReturnBalanceResponse.getStatusCode().is2xxSuccessful() && taxReturnBalanceResponse.getBody() != null) {
	            totalBalance = totalBalance.add(taxReturnBalanceResponse.getBody());
	        }
	    }

	    return ResponseEntity.ok(totalBalance);
	}


}
