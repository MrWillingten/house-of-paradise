// TripController.java
package com.travel.trip.controller;

import com.travel.trip.model.Trip;
import com.travel.trip.model.TripBooking;
import com.travel.trip.repository.TripRepository;
import com.travel.trip.repository.TripBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TripController {
    
    @Autowired
    private TripRepository tripRepository;
    
    @Autowired
    private TripBookingRepository bookingRepository;
    
    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "trip-service");
        return ResponseEntity.ok(response);
    }
    
    // Get all trips
    @GetMapping("/trips")
    public ResponseEntity<Map<String, Object>> getAllTrips(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String transportType) {
        
        List<Trip> trips;
        
        if (origin != null && destination != null) {
            trips = tripRepository.findByOriginAndDestination(origin, destination);
        } else if (transportType != null) {
            trips = tripRepository.findByTransportType(transportType);
        } else {
            trips = tripRepository.findAll();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", trips);
        return ResponseEntity.ok(response);
    }
    
    // Get trip by ID
    @GetMapping("/trips/{id}")
    public ResponseEntity<Map<String, Object>> getTripById(@PathVariable Long id) {
        Optional<Trip> trip = tripRepository.findById(id);
        Map<String, Object> response = new HashMap<>();
        
        if (trip.isPresent()) {
            response.put("success", true);
            response.put("data", trip.get());
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("error", "Trip not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Create new trip
    @PostMapping("/trips")
    public ResponseEntity<Map<String, Object>> createTrip(@RequestBody Trip trip) {
        Trip savedTrip = tripRepository.save(trip);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", savedTrip);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Update trip
    @PutMapping("/trips/{id}")
    public ResponseEntity<Map<String, Object>> updateTrip(@PathVariable Long id, @RequestBody Trip tripDetails) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<Trip> tripOptional = tripRepository.findById(id);
        if (tripOptional.isEmpty()) {
            response.put("success", false);
            response.put("error", "Trip not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        Trip trip = tripOptional.get();
        trip.setOrigin(tripDetails.getOrigin());
        trip.setDestination(tripDetails.getDestination());
        trip.setDepartureTime(tripDetails.getDepartureTime());
        trip.setArrivalTime(tripDetails.getArrivalTime());
        trip.setTransportType(tripDetails.getTransportType());
        trip.setPrice(tripDetails.getPrice());
        trip.setAvailableSeats(tripDetails.getAvailableSeats());
        trip.setCarrier(tripDetails.getCarrier());
        
        Trip updatedTrip = tripRepository.save(trip);
        response.put("success", true);
        response.put("data", updatedTrip);
        return ResponseEntity.ok(response);
    }
    
    // Delete trip
    @DeleteMapping("/trips/{id}")
    public ResponseEntity<Map<String, Object>> deleteTrip(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        if (!tripRepository.existsById(id)) {
            response.put("success", false);
            response.put("error", "Trip not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        tripRepository.deleteById(id);
        response.put("success", true);
        response.put("message", "Trip deleted");
        return ResponseEntity.ok(response);
    }
    
    // Create booking
    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody TripBooking booking) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<Trip> tripOptional = tripRepository.findById(booking.getTripId());
        if (tripOptional.isEmpty()) {
            response.put("success", false);
            response.put("error", "Trip not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        Trip trip = tripOptional.get();
        
        if (trip.getAvailableSeats() < booking.getNumberOfSeats()) {
            response.put("success", false);
            response.put("error", "Not enough seats available");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Calculate total price
        double totalPrice = trip.getPrice() * booking.getNumberOfSeats();
        booking.setTotalPrice(totalPrice);
        
        // Save booking
        TripBooking savedBooking = bookingRepository.save(booking);
        
        // Update available seats
        trip.setAvailableSeats(trip.getAvailableSeats() - booking.getNumberOfSeats());
        tripRepository.save(trip);
        
        response.put("success", true);
        response.put("data", savedBooking);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // Get bookings for user
    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserBookings(@PathVariable String userId) {
        List<TripBooking> bookings = bookingRepository.findByUserId(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", bookings);
        return ResponseEntity.ok(response);
    }
    
    // Update booking status
    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBookingStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> statusUpdate) {
        
        Map<String, Object> response = new HashMap<>();
        Optional<TripBooking> bookingOptional = bookingRepository.findById(id);
        
        if (bookingOptional.isEmpty()) {
            response.put("success", false);
            response.put("error", "Booking not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        TripBooking booking = bookingOptional.get();
        booking.setStatus(statusUpdate.get("status"));
        TripBooking updatedBooking = bookingRepository.save(booking);
        
        response.put("success", true);
        response.put("data", updatedBooking);
        return ResponseEntity.ok(response);
    }
}