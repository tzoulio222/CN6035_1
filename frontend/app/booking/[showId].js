import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronRight, Clock, Sparkles, Ticket } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import apiClient from '../../src/api/client';
import { formatCurrency, formatDateLabel, formatTimeLabel, groupSeatsByRow } from '../../src/lib/format';

const COLORS = {
  bg: '#050816',
  panel: '#0b0e23',
  panelSoft: 'rgba(255,255,255,0.03)',
  panelBorder: 'rgba(255,255,255,0.08)',
  text: '#ffffff',
  muted: '#94a3b8',
  cyan: '#22d3ee',
  cyanSoft: 'rgba(34,211,238,0.18)',
  cyanBorder: 'rgba(34,211,238,0.45)',
  cyanText: '#0b0e23',
  grayButton: '#1e293b',
  whiteSoft: 'rgba(255,255,255,0.05)',
};

export default function BookingDetailsScreen() {
  const { showId, reservationId } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
  const [selectedSeat, setSelectedSeat] = useState('');

  // Αν τροποποιούμε κράτηση, φορτώνουμε τα υπάρχοντα στοιχεία της.
  const { data: existingReservation } = useQuery({
    queryKey: ['reservation', reservationId],
    enabled: Boolean(reservationId),
    queryFn: async () => {
      const res = await apiClient.get('/api/user/reservations');
      return res.data.data.find(r => String(r.id) === String(reservationId));
    }
  });

  useEffect(() => {
    if (existingReservation) {
      setSelectedShowtimeId(String(existingReservation.showtime_id));
      setSelectedSeat(existingReservation.seat_number);
    }
  }, [existingReservation]);

  const { data: showtimes, isLoading } = useQuery({
    queryKey: ['showtimes', showId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/showtimes/${showId}`);
      return res.data.data;
    },
  });

  // Φορτώνουμε τις διαθέσιμες θέσεις για το επιλεγμένο session.
  const { data: seatMap, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', selectedShowtimeId],
    enabled: Boolean(selectedShowtimeId),
    queryFn: async () => {
      const res = await apiClient.get(`/api/seats/${selectedShowtimeId}`);
      return res.data.data;
    },
  });

  // Κάνουμε την κράτηση όταν ο χρήστης διαλέξει θέση και πατήσει επιβεβαίωση.
  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (reservationId) {
        return apiClient.patch(`/api/reservations/${reservationId}`, {
          showtimeId: selectedShowtimeId,
          seatNumber: selectedSeat,
        });
      }
      return apiClient.post('/api/reservations', {
        showtimeId: selectedShowtimeId,
        seatNumber: selectedSeat,
      });
    },
    onSuccess: () => {
      const msg = reservationId ? 'Your booking has been updated!' : 'Your booking has been confirmed!';
      Alert.alert('Success', msg, [
        { text: 'View tickets', onPress: () => router.replace('/(tabs)/bookings') },
      ]);
      queryClient.invalidateQueries({ queryKey: ['seats', selectedShowtimeId] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error) => {
      Alert.alert('Action failed', error.response?.data?.message || 'Please try again');
    },
  });

  const selectedShowtime = useMemo(
    () => showtimes?.find((item) => String(item.id) === String(selectedShowtimeId)),
    [showtimes, selectedShowtimeId]
  );
  const rows = useMemo(() => groupSeatsByRow(seatMap?.seats || []), [seatMap]);
  const seatPrice = selectedSeat ? Number(seatMap?.showtime?.price || seatMap?.price || 0) : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.cyan} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerBlock}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowLine} />
            <Text style={styles.eyebrowText}>{reservationId ? 'Modification' : 'Time Selection'}</Text>
          </View>
          <Text style={styles.title}>{reservationId ? 'Update Slot.' : 'Pick a session.'}</Text>
          <Text style={styles.subtitle}>
            {reservationId 
              ? 'You are modifying an existing reservation. Choose a new session or seat to update your slot.'
              : 'Tap a session to open the seat map and choose your seats.'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Nodes Available" value={`${showtimes?.length || 0} Slots`} icon={Clock} />
          <StatCard
            label="Selection"
            value={selectedShowtime ? 'Identity Set' : 'Awaiting'}
            icon={Sparkles}
            accentColor={selectedShowtime ? COLORS.cyan : '#8b5cf6'}
          />
        </View>

        <View style={styles.listWrap}>
          {showtimes?.length > 0 ? (
            showtimes.map((st) => {
      const selected = String(selectedShowtimeId) === String(st.id);

              return (
                <TouchableOpacity
                  key={st.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    // Όταν αλλάζει session, καθαρίζουμε την προηγούμενη θέση.
                    setSelectedShowtimeId(String(st.id));
                    setSelectedSeat('');
                  }}
                  style={[styles.showtimeCard, selected && styles.showtimeCardSelected]}
                >
                  <View style={styles.showtimeTopRow}>
                    <View style={styles.showtimeLeft}>
                      <View style={styles.rowInline}>
                        <Calendar size={14} color={selected ? COLORS.cyanText : COLORS.cyan} />
                        <Text style={[styles.smallCaps, selected && styles.smallCapsSelected]}>
                          {formatDateLabel(st.start_time)}
                        </Text>
                      </View>
                      <View style={styles.rowInline}>
                        <Clock size={24} color={selected ? COLORS.cyanText : COLORS.text} />
                        <Text style={[styles.timeText, selected && styles.timeTextSelected]}>
                          {formatTimeLabel(st.start_time)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.showtimeRight}>
                      <Text style={[styles.priceText, selected && styles.priceTextSelected]}>
                        {formatCurrency(st.price)}
                      </Text>
                      <Text style={[styles.tinyCaps, selected && styles.tinyCapsSelected]}>Node Value</Text>
                    </View>
                  </View>

                  <View style={[styles.showtimeBottomRow, selected ? styles.showtimeBottomRowSelected : null]}>
                    <View style={styles.rowInline}>
                      <View style={[styles.ticketBadge, selected ? styles.ticketBadgeSelected : null]}>
                        <Ticket size={16} color={selected ? COLORS.cyanText : COLORS.cyan} />
                      </View>
                      <Text style={[styles.theatreText, selected && styles.theatreTextSelected]}>
                        {st.theatre_name}
                      </Text>
                    </View>
                    <View style={[styles.chevronBadge, selected && styles.chevronBadgeSelected]}>
                      <ChevronRight size={20} color={selected ? COLORS.cyanText : COLORS.text} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <EmptyState title="No Nodes Found" description="This show currently has no scheduled session points. Please check back later." />
          )}
        </View>

        {selectedShowtimeId ? (
          <View style={styles.seatSection}>
            <View style={styles.seatHeader}>
              <View>
                <Text style={styles.eyebrowText}>Seat Selection</Text>
                <Text style={styles.seatTitle}>Choose your seats.</Text>
              </View>
              <View style={styles.iconCircle}>
                <Ticket size={20} color={COLORS.cyan} />
              </View>
            </View>

            {seatsLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={COLORS.cyan} />
              </View>
            ) : rows.length > 0 ? (
              <View style={styles.seatGridCard}>
                {rows.map((row) => (
                  <View key={row.row} style={styles.seatRow}>
                    <Text style={styles.rowLabel}>{row.row}</Text>
                    <View style={styles.seatRowInner}>
                        {row.seats.map((seat) => {
                          const selected = selectedSeat === seat.seatNumber;
                          const unavailable = seat.booked;
                          return (
                            <TouchableOpacity
                            key={seat.seatNumber}
                            disabled={unavailable || bookingMutation.isPending}
                            activeOpacity={0.75}
                            onPress={() => setSelectedSeat(seat.seatNumber)}
                            style={[
                              styles.seatButton,
                              unavailable && styles.seatButtonUnavailable,
                              selected && styles.seatButtonSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.seatText,
                                selected && styles.seatTextSelected,
                                unavailable && styles.seatTextUnavailable,
                              ]}
                            >
                              {seat.seatNumber}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    <Text style={styles.rowLabel}>{row.row}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState title="No Seats" description="This session does not have a seat map yet." />
            )}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTopRow}>
          <View>
            <Text style={styles.footerLabel}>{reservationId ? 'Update Node' : 'Initialize Node'}</Text>
            <Text style={styles.footerTitle}>
              {selectedSeat ? 'Seat Selected' : selectedShowtime ? 'Session Selected' : 'Select Session'}
            </Text>
          </View>
          <View style={styles.iconCircle}>
            <Sparkles size={22} color={COLORS.cyan} />
          </View>
        </View>

        <TouchableOpacity
          disabled={!selectedSeat || bookingMutation.isPending}
          onPress={() => {
            if (!selectedSeat) {
              return;
            }

            if (!user) {
              // Χωρίς login δεν επιτρέπουμε τελική κράτηση.
              Alert.alert('Identification Required', 'Please establish a session to complete your reservation.', [
                { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
                { text: 'Cancel', style: 'cancel' },
              ]);
              return;
            }

            bookingMutation.mutate();
          }}
          style={[styles.primaryButton, !selectedSeat && styles.primaryButtonDisabled]}
        >
          <Text style={[styles.primaryButtonText, !selectedSeat && styles.primaryButtonTextDisabled]}>
            {reservationId ? 'Update Reservation' : 'Confirm Booking'}
          </Text>
          <ChevronRight size={18} color={selectedSeat ? COLORS.cyanText : '#475569'} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon: Icon, accentColor = COLORS.cyan }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <Icon size={18} color={accentColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ title, description }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  loadingWrap: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrowLine: {
    width: 4,
    height: 16,
    borderRadius: 999,
    backgroundColor: COLORS.cyan,
    marginRight: 12,
  },
  eyebrowText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 40,
    letterSpacing: -1.5,
  },
  subtitle: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 320,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statLabel: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  listWrap: {
    paddingHorizontal: 24,
  },
  showtimeCard: {
    marginBottom: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: 24,
  },
  showtimeCardSelected: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: COLORS.cyan,
  },
  showtimeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  showtimeLeft: {
    flex: 1,
    paddingRight: 16,
  },
  showtimeRight: {
    alignItems: 'flex-end',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallCaps: {
    marginLeft: 8,
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  smallCapsSelected: {
    color: 'rgba(11,14,35,0.6)',
  },
  timeText: {
    marginLeft: 12,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  timeTextSelected: {
    color: COLORS.cyanText,
  },
  priceText: {
    color: COLORS.cyan,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  priceTextSelected: {
    color: COLORS.cyanText,
  },
  tinyCaps: {
    marginTop: 4,
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tinyCapsSelected: {
    color: 'rgba(11,14,35,0.6)',
  },
  showtimeBottomRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 20,
  },
  showtimeBottomRowSelected: {
    borderTopColor: 'rgba(11,14,35,0.1)',
  },
  ticketBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ticketBadgeSelected: {
    backgroundColor: 'rgba(11,14,35,0.1)',
  },
  theatreText: {
    marginLeft: 12,
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '900',
  },
  theatreTextSelected: {
    color: COLORS.cyanText,
  },
  chevronBadge: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  chevronBadgeSelected: {
    backgroundColor: COLORS.cyanText,
  },
  seatSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  seatHeader: {
    paddingHorizontal: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  seatGridCard: {
    paddingVertical: 28,
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  seatRow: {
    marginBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatRowInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  rowLabel: {
    width: 24,
    color: '#475569',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  seatButton: {
    width: 40,
    height: 40,
    margin: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButtonSelected: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: COLORS.cyan,
  },
  seatButtonUnavailable: {
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.25,
  },
  seatText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '900',
  },
  seatTextSelected: {
    color: COLORS.cyanText,
  },
  seatTextUnavailable: {
    color: 'rgba(148,163,184,0.6)',
  },
  emptyCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: 24,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#64748b',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: COLORS.panel,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  footerTopRow: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  footerTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  primaryButton: {
    height: 68,
    borderRadius: 18,
    backgroundColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.grayButton,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: COLORS.cyanText,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  primaryButtonTextDisabled: {
    color: '#64748b',
  },
});
