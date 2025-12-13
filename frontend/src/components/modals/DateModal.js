import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const DateModal = ({ isOpen, onClose, selectedDate, onSelect, darkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const handleDateSelect = (date) => {
    onSelect(date);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={styles.overlay}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.modal,
          background: darkMode ? '#1f2937' : 'white',
          color: darkMode ? '#e5e7eb' : '#1f2937',
        }}
      >
        <div style={styles.modalHeader}>
          <h2>Select Date</h2>
          <button
            onClick={onClose}
            className="clickable modal-close"
            style={styles.closeButton}
          >
            <X size={24} />
          </button>
        </div>

        <div style={styles.calendarHeader}>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
              )
            }
            className="clickable cal-nav"
            style={styles.navButton}
          >
            <ChevronLeft />
          </button>
          <span style={styles.monthLabel}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
              )
            }
            className="clickable cal-nav"
            style={styles.navButton}
          >
            <ChevronRight />
          </button>
        </div>

        <div style={styles.calendar}>
          <div style={styles.weekdays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={styles.weekday}>
                {day}
              </div>
            ))}
          </div>
          <div style={styles.calendarDays}>
            {generateCalendar(currentMonth).map((date, i) => (
              <div
                key={i}
                style={{
                  ...styles.calendarDay,
                  ...(date && styles.calendarDayActive),
                  ...(selectedDate &&
                    date &&
                    date.toDateString() === selectedDate.toDateString() &&
                    styles.calendarDaySelected),
                }}
                onClick={() => date && handleDateSelect(date)}
                className={date ? 'clickable cal-day' : ''}
              >
                {date ? date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  navButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  monthLabel: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  calendar: {
    marginBottom: '1rem',
  },
  weekdays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  weekday: {
    padding: '0.5rem',
  },
  calendarDays: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  calendarDay: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: 'transparent',
    transition: 'all 0.2s',
  },
  calendarDayActive: {
    color: '#1f2937',
    cursor: 'pointer',
  },
  calendarDaySelected: {
    background: '#10b981',
    color: 'white',
    fontWeight: '700',
  },
};

export default DateModal;
