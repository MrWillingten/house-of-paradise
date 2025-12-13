import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/api';
import { Plane, Train, Bus, Calendar, Clock, Users, ArrowLeft } from 'lucide-react';

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    numberOfSeats: 1,
    userId: 'user123', // Hardcoded for now
  });

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await tripService.getById(id);
      setTrip(response.data.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      alert('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = () => {
    switch(trip?.transportType?.toLowerCase()) {
      case 'flight': return <Plane size={48} />;
      case 'train': return <Train size={48} />;
      case 'bus': return <Bus size={48} />;
      default: return <Plane size={48} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = () => {
    const departure = new Date(trip.departureTime);
    const arrival = new Date(trip.arrivalTime);
    const hours = Math.floor((arrival - departure) / (1000 * 60 * 60));
    const minutes = Math.floor(((arrival - departure) % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalPrice = () => {
    return trip.price * bookingData.numberOfSeats;
  };

  const handleBooking = () => {
    if (bookingData.numberOfSeats < 1) {
      alert('Please select at least 1 seat');
      return;
    }
    
    if (bookingData.numberOfSeats > trip.availableSeats) {
      alert('Not enough seats available');
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        type: 'trip',
        item: trip,
        bookingData: {
          ...bookingData,
          tripId: trip.id,
          totalPrice: calculateTotalPrice(),
        }
      } 
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!trip) {
    return <div style={styles.loading}>Trip not found</div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/trips')} style={styles.backButton}>
        <ArrowLeft size={20} />
        Back to Trips
      </button>

      <div style={styles.content}>
        <div style={styles.headerCard}>
          <div style={styles.transportIcon}>
            {getTransportIcon()}
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{trip.origin} → {trip.destination}</h1>
            <div style={styles.carrier}>Operated by {trip.carrier}</div>
          </div>
        </div>

        <div style={styles.detailsCard}>
          <h2 style={styles.sectionTitle}>Trip Details</h2>
          
          <div style={styles.timeline}>
            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <div style={styles.timelineTitle}>Departure</div>
                <div style={styles.timelineLocation}>{trip.origin}</div>
                <div style={styles.timelineDate}>{formatDate(trip.departureTime)}</div>
              </div>
            </div>

            <div style={styles.timelineLine}></div>

            <div style={styles.timelineItem}>
              <div style={styles.timelineDot}></div>
              <div style={styles.timelineContent}>
                <div style={styles.timelineTitle}>Arrival</div>
                <div style={styles.timelineLocation}>{trip.destination}</div>
                <div style={styles.timelineDate}>{formatDate(trip.arrivalTime)}</div>
              </div>
            </div>
          </div>

          <div style={styles.info}>
            <div style={styles.infoCard}>
              <Clock size={24} color="#f5576c" />
              <div style={styles.infoLabel}>Duration</div>
              <div style={styles.infoValue}>{calculateDuration()}</div>
            </div>

            <div style={styles.infoCard}>
              <Users size={24} color="#f5576c" />
              <div style={styles.infoLabel}>Available Seats</div>
              <div style={styles.infoValue}>{trip.availableSeats}</div>
            </div>

            <div style={styles.infoCard}>
              <Calendar size={24} color="#f5576c" />
              <div style={styles.infoLabel}>Transport Type</div>
              <div style={styles.infoValue}>{trip.transportType}</div>
            </div>
          </div>
        </div>

        <div style={styles.bookingCard}>
          <h2 style={styles.bookingTitle}>Book Your Trip</h2>
          
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Users size={18} />
                Number of Seats
              </label>
              <input
                type="number"
                value={bookingData.numberOfSeats}
                onChange={(e) => setBookingData({...bookingData, numberOfSeats: parseInt(e.target.value)})}
                style={styles.input}
                min="1"
                max={trip.availableSeats}
              />
              <div style={styles.hint}>
                Max {trip.availableSeats} seats available
              </div>
            </div>

            <div style={styles.priceBox}>
              <div>
                <div style={styles.priceLabel}>Price per seat:</div>
                <div style={styles.priceSmall}>${trip.price}</div>
              </div>
              <div>
                <div style={styles.priceLabel}>Total Price:</div>
                <div style={styles.priceValue}>${calculateTotalPrice()}</div>
              </div>
            </div>

            <button onClick={handleBooking} style={styles.bookButton}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '2rem',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    border: '2px solid #e5e7eb',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginBottom: '2rem',
    maxWidth: '1200px',
    margin: '0 auto 2rem',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    padding: '2rem',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    color: 'white',
  },
  transportIcon: {
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  carrier: {
    fontSize: '1.1rem',
    opacity: 0.9,
  },
  detailsCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '2rem',
  },
  timeline: {
    position: 'relative',
    marginBottom: '2rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  timelineDot: {
    width: '16px',
    height: '16px',
    background: '#f5576c',
    borderRadius: '50%',
    marginTop: '0.5rem',
  },
  timelineLine: {
    position: 'absolute',
    left: '7px',
    top: '50px',
    bottom: '50px',
    width: '2px',
    background: '#e5e7eb',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  timelineLocation: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  timelineDate: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  info: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  infoCard: {
    background: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  infoValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: '0.25rem',
    textTransform: 'capitalize',
  },
  bookingCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  },
  bookingTitle: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
  },
  hint: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  priceBox: {
    background: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.25rem',
  },
  priceSmall: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#4b5563',
  },
  priceValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  bookButton: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontSize: '1.5rem',
    color: '#6b7280',
  },
};

export default TripDetail;