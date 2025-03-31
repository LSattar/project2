package com.skillstorm.taxtracker.repositories;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.skillstorm.taxtracker.models.Client;

@Repository
public interface ClientRepository extends CrudRepository<Client, Integer> {

	Iterable<Client> findByLastNameStartingWith(String startsWith);

	boolean existsByEmploymentSectorId(int id);
	
	Iterable<Client> findByIsActiveTrue();

	Optional<Client> findByHashedSsn(String hashedSsn);
	
}
