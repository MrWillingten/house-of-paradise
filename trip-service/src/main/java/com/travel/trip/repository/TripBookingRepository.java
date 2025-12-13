// TripBookingRepository.java
package com.travel.trip.repository;

import com.travel.trip.model.TripBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TripBookingRepository extends JpaRepository<TripBooking, Long> {
    List<TripBooking> findByUserId(String userId);
}