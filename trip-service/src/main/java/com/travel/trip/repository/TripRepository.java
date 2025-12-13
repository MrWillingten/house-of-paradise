// TripRepository.java
package com.travel.trip.repository;

import com.travel.trip.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByOriginAndDestination(String origin, String destination);
    List<Trip> findByTransportType(String transportType);
}