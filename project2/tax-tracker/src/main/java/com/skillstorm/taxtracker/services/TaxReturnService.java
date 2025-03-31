package com.skillstorm.taxtracker.services;

import java.net.URI;
import org.slf4j.*;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.*;
import org.springframework.web.server.ResponseStatusException;
import com.skillstorm.taxtracker.models.EmploymentSector;
import com.skillstorm.taxtracker.repositories.ClientRepository;
import com.skillstorm.taxtracker.repositories.CpaRepository;
import com.skillstorm.taxtracker.repositories.EmploymentSectorRepository;
import com.skillstorm.taxtracker.repositories.TaxReturnRepository;
import com.skillstorm.taxtracker.dtos.TaxReturnDTO;
import com.skillstorm.taxtracker.models.Client;
import com.skillstorm.taxtracker.models.Cpa;
import com.skillstorm.taxtracker.models.TaxReturn;


@Service
public class TaxReturnService {

	@Value("${base-url}")
	private String baseURL;
	
	private static Logger logger = LoggerFactory.getLogger(TaxReturnService.class);

	private TaxReturnRepository repo;
	private ClientRepository clientRepo;
	private CpaRepository cpaRepo;
	private EmploymentSectorRepository employmentRepo;
	
    final int MAX_RETURNS_PER_CPA = 5;

	public TaxReturnService(TaxReturnRepository repo, ClientRepository clientRepo, CpaRepository cpaRepo, EmploymentSectorRepository employmentRepo) {
		this.repo = repo;
		this.clientRepo = clientRepo;
		this.cpaRepo = cpaRepo; 
		this.employmentRepo = employmentRepo;
	}

	public ResponseEntity<Iterable<TaxReturn>> findAllByYear(Integer year) {
	    try {
	        Iterable<TaxReturn> returns;

	        if (year == null)
	            returns = repo.findAll(); 
	        else
	            returns = repo.findByYear(year);

	        if (!returns.iterator().hasNext())
	            return ResponseEntity.noContent().build();
	        else
	            return ResponseEntity.ok(returns);

	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	
	// Find tax return by employment sector
	public ResponseEntity<Iterable<TaxReturn>> findByEmploymentSector(Integer employmentSectorId) {
	    if (employmentSectorId == null || !employmentRepo.existsById(employmentSectorId)) {
	        return ResponseEntity.badRequest().body(null);
	    }

	    try {
	        Iterable<TaxReturn> returns = repo.findByEmploymentSectorId(employmentSectorId);
	        return returns.iterator().hasNext() ? ResponseEntity.ok(returns) : ResponseEntity.noContent().build();
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	// Find tax return by CPA
	public ResponseEntity<Iterable<TaxReturn>> findByCpa(Integer cpaId) {
	    if (cpaId == null || !cpaRepo.existsById(cpaId)) {
	        return ResponseEntity.badRequest().body(null);
	    }

	    try {
	        Iterable<TaxReturn> returns = repo.findByCpaId(cpaId);
	        return returns.iterator().hasNext() ? ResponseEntity.ok(returns) : ResponseEntity.noContent().build();
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
	
	// Find tax return by client
	public ResponseEntity<Iterable<TaxReturn>> findByClient(Integer clientId) {
	    if (clientId == null || !clientRepo.existsById(clientId)) {
	        return ResponseEntity.badRequest().body(null);
	    }

	    try {
	        Iterable<TaxReturn> returns = repo.findByClientId(clientId);
	        return returns.iterator().hasNext() ? ResponseEntity.ok(returns) : ResponseEntity.noContent().build();
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	
	// Find tax return by ID
    public ResponseEntity<TaxReturn> findTaxReturnById(int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }


	// Create tax return
    public ResponseEntity<TaxReturn> createTaxReturn(TaxReturnDTO dto) {
        try {
            Client client = clientRepo.findById(dto.client().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            Cpa cpa = null;
            if (dto.cpa() != null) {
                cpa = cpaRepo.findById(dto.cpa().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));
            }

            EmploymentSector employmentSector = employmentRepo.findById(dto.employmentSector().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            if (repo.existsByClientIdAndYear(client.getId(), dto.year())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .header("X-Error-Message", "A tax return already exists for this client in the specified year.")
                        .body(null);
            }

            if (cpa != null) {
                int returnCount = repo.countByCpaIdAndYear(cpa.getId(), dto.year());
                if (returnCount >= MAX_RETURNS_PER_CPA) {
                    return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE)
                            .header("X-Error-Message", "The CPA has reached the maximum allowed tax returns for this year.")
                            .body(null);
                }
            }

            LocalDate now = LocalDate.now();
            TaxReturn newTaxReturn = new TaxReturn(
                    0, client, cpa, dto.year(), dto.status(),
                    dto.amountOwed(), dto.amountPaid(), dto.cost(),
                    employmentSector,
                    dto.totalIncome(), dto.adjustments(), dto.filingStatus(),
                    now, null
            );

            TaxReturn saved = repo.save(newTaxReturn);

            return ResponseEntity.created(new URI(this.baseURL + "tax-return/" + saved.getId())).body(saved);

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
	
    // Update a tax return
    public ResponseEntity<TaxReturn> updateTaxReturn(int id, TaxReturnDTO dto) {
        try {
        	logger.info("Starting update process for TaxReturn with ID: {} | totalIncome: {} | adjustments: {} | filingStatus: {}",
        	        id, dto.totalIncome(), dto.adjustments(), dto.filingStatus());


            if (!repo.existsById(id)) {
                logger.warn("TaxReturn with ID {} not found", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            logger.debug("Fetching client with ID: {}", dto.client().getId());
            Client client = clientRepo.findById(dto.client().getId())
                    .orElseThrow(() -> {
                        logger.error("Invalid client ID: {}", dto.client().getId());
                        return new ResponseStatusException(HttpStatus.BAD_REQUEST);
                    });

            Cpa cpa = null;
            if (dto.cpa() != null) {
                logger.debug("Fetching CPA with ID: {}", dto.cpa().getId());
                cpa = cpaRepo.findById(dto.cpa().getId())
                        .orElseThrow(() -> {
                            logger.error("Invalid CPA ID: {}", dto.cpa().getId());
                            return new ResponseStatusException(HttpStatus.BAD_REQUEST);
                        });
            }

            logger.debug("Fetching employment sector with ID: {}", dto.employmentSector().getId());
            EmploymentSector employmentSector = employmentRepo.findById(dto.employmentSector().getId())
                    .orElseThrow(() -> {
                        logger.error("Invalid employment sector ID: {}", dto.employmentSector().getId());
                        return new ResponseStatusException(HttpStatus.BAD_REQUEST);
                    });

            logger.debug("Fetching existing TaxReturn with ID: {}", id);
            TaxReturn existingTaxReturn = repo.findById(id)
                    .orElseThrow(() -> {
                        logger.error("Existing TaxReturn with ID {} not found", id);
                        return new ResponseStatusException(HttpStatus.NOT_FOUND);
                    });

            Optional<TaxReturn> existingRecord = repo.findByClientIdAndYear(client.getId(), dto.year());

            if (existingRecord.isPresent() && existingRecord.get().getId() != id) {
                logger.warn("Conflict: Client ID {} already has a tax return for year {}", client.getId(), dto.year());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .header("X-Error-Message", "The client already has a tax return for this year")
                        .body(null);
            }



            logger.debug("Counting tax returns for CPA ID {} in year {}", (cpa != null ? cpa.getId() : "N/A"), dto.year());
            int returnCount = (cpa != null) ? repo.countByCpaIdAndYear(cpa.getId(), dto.year()) : 0;

            if (cpa != null && returnCount >= MAX_RETURNS_PER_CPA) {
                logger.warn("Conflict: CPA ID {} has reached max returns ({}) for year {}", cpa.getId(), MAX_RETURNS_PER_CPA, dto.year());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .header("X-Error-Message", "The CPA has reached the maximum allowed tax returns for this year.")
                        .body(null);
            }

            logger.info("Updating TaxReturn with ID: {}", id);
            TaxReturn updated = new TaxReturn(
                    id, client, cpa, dto.year(), dto.status(),
                    dto.amountOwed(), dto.amountPaid(), dto.cost(),
                    employmentSector, 
                    dto.totalIncome(), dto.adjustments(), dto.filingStatus(), 
                    existingTaxReturn.getCreationDate(), LocalDate.now()
            );


            repo.save(updated);
            logger.info("Successfully updated TaxReturn with ID: {}", id);
            return ResponseEntity.ok(updated);

        } catch (ResponseStatusException e) {
            logger.error("ResponseStatusException occurred: {}", e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(null);
        } catch (Exception e) {
            logger.error("Unexpected error occurred while updating TaxReturn ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("X-Error-Message", "Unknown error")
                    .build();
        }
    }


	// Delete tax return
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

}
