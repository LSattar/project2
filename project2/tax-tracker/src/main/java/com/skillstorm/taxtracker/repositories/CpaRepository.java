package com.skillstorm.taxtracker.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import com.skillstorm.taxtracker.models.Cpa;

@Repository
public interface CpaRepository extends CrudRepository<Cpa, Integer> {

	Iterable<Cpa> findByLastNameStartingWith(String startsWith);

}
