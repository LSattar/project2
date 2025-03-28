package com.skillstorm.taxtracker.repositories;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.skillstorm.taxtracker.models.EmploymentSector;

@Repository
public interface EmploymentSectorRepository extends CrudRepository<EmploymentSector, Integer> {

	Iterable<EmploymentSector> findByEmploymentSectorNameStartingWith(String startsWith);
	

}
