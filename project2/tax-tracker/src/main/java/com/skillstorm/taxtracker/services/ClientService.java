package com.skillstorm.taxtracker.services;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import com.skillstorm.taxtracker.repositories.ClientRepository;
import com.skillstorm.taxtracker.repositories.EmploymentSectorRepository;
import com.skillstorm.taxtracker.utils.HashUtil;
import com.skillstorm.taxtracker.dtos.ClientDTO;
import com.skillstorm.taxtracker.models.Client;
import com.skillstorm.taxtracker.models.EmploymentSector;

@Service
public class ClientService {

    @Value("${base-url}")
    private String baseURL;

    private final ClientRepository repo;
    private final EmploymentSectorRepository employmentSectorRepo;

    public ClientService(ClientRepository repo, EmploymentSectorRepository employmentSectorRepo) {
        this.repo = repo;
        this.employmentSectorRepo = employmentSectorRepo;
    }

    // Find client by ID
    public ResponseEntity<Client> findClientById(int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Find clients by last name
    public ResponseEntity<Iterable<Client>> findAll(String startsWith) {
        Iterable<Client> clients = (startsWith == null) ? repo.findByIsActiveTrue() 
                                                        : repo.findByLastNameStartingWith(startsWith);
        return clients.iterator().hasNext() ? ResponseEntity.ok(clients) 
                                            : ResponseEntity.noContent().build();
    }
    
    // Find client by SSN
    public ResponseEntity<Client> findBySsn(String ssn) {
        String hashedSSN = HashUtil.hashSSN(ssn); 
        return repo.findByHashedSsn(hashedSSN)
                   .map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create client
    public ResponseEntity<Client> createClient(ClientDTO dto) {
        try {
            EmploymentSector employmentSector = employmentSectorRepo.findById(dto.employmentSector().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            String hashedSsn = HashUtil.hashSSN(dto.ssn());

            Client newClient = new Client(0, dto.firstName(), dto.lastName(), dto.ssn(), hashedSsn, dto.dob(),
                    dto.phone(), dto.email(), dto.address1(), dto.address2(), dto.city(), dto.state(), dto.zip(),
                    employmentSector, true);

            Client saved = repo.save(newClient);
            return ResponseEntity.created(new URI(baseURL + saved.getId())).body(saved);

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Update client but preserve hashed SSN
    public ResponseEntity<Client> updateClient(int id, ClientDTO dto) {
        try {
            Client existingClient = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            EmploymentSector employmentSector = employmentSectorRepo.findById(dto.employmentSector().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST));

            String hashedSsn = existingClient.getHashedSsn();
            if (!dto.ssn().equals(existingClient.getSsn())) {
                hashedSsn = HashUtil.hashSSN(dto.ssn());
            }

            Client updated = repo.save(new Client(id, dto.firstName(), dto.lastName(), dto.ssn(), hashedSsn, dto.dob(),
                    dto.phone(), dto.email(), dto.address1(), dto.address2(), dto.city(), dto.state(), dto.zip(),
                    employmentSector, true));

            return ResponseEntity.ok(updated);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Deactivate client by removing personal details
    public ResponseEntity<Client> deactivateClient(int id) {
        try {
            Client client = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

            client.deactivateClient(); 
            repo.save(client);
            return ResponseEntity.ok(client);

        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(null);
        }
    }

    // Reactivate client using SSN
    public ResponseEntity<Client> reactivateClient(String ssn, ClientDTO dto) {
        try {
            String hashedSsn = HashUtil.hashSSN(ssn);

            Client client = repo.findByHashedSsn(hashedSsn)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));

            client.reactivateClient(dto.firstName(), dto.lastName(), dto.ssn(), dto.dob(), dto.phone(), dto.email(),
                    dto.address1(), dto.address2(), dto.city(), dto.state(), dto.zip());

            repo.save(client);
            return ResponseEntity.ok(client);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Delete client
    public ResponseEntity<Void> deleteById(int id) {
        try {
            if (repo.existsById(id)) {
                repo.deleteById(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
