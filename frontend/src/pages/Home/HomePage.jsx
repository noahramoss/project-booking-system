import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import HotelCard from '../../components/HotelCard/HotelCard';
import RoomCard from '../../components/RoomCard/RoomCard';
import Loader from '../../components/Loader/Loader';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { user } = useAuth();
  const { fetchApi, loading } = useApi();
  const navigate = useNavigate();
  
  // States para USER
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ hotelName: '', type: '' });
  
  // States para MANAGER / ADMIN
  const [hotels, setHotels] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, cancelled: 0 });

  useEffect(() => {
    if (user.role === 'USER') {
      loadRooms();
    } else {
      loadHotelsAndStats();
    }
  }, [user.role]);

  const loadRooms = async () => {
    try {
      const query = new URLSearchParams();
      if (filters.hotelName) query.append('hotelName', filters.hotelName);
      if (filters.type) query.append('type', filters.type);
      
      const data = await fetchApi(`/room?${query.toString()}`);
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHotelsAndStats = async () => {
    try {
      // 1. Cargar hoteles
      const hotelsData = await fetchApi('/hotel');
      
      // Filtramos en el frontend si es MANAGER (el admin ve todos)
      let displayHotels = hotelsData.hotels || [];
      if (user.role === 'MANAGER') {
        displayHotels = displayHotels.filter(h => h.managerEmail === user.email);
      }
      setHotels(displayHotels);

      // 2. Cargar reservas para las estadísticas
      const bookingsData = await fetchApi('/booking');
      const bookings = bookingsData.bookings || [];
      
      const newStats = { pending: 0, confirmed: 0, cancelled: 0 };
      bookings.forEach(b => {
        if (b.status === 'PENDING') newStats.pending++;
        if (b.status === 'CONFIRMED') newStats.confirmed++;
        if (b.status === 'CANCELLED') newStats.cancelled++;
      });
      setStats(newStats);
      
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadRooms();
  };

  // --- RENDERIZADO POR ROL ---

  if (loading) return <Loader />;

  if (user.role === 'USER') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Encuentra tu próxima estancia</h1>
          <p>Busca entre nuestras habitaciones disponibles</p>
        </div>

        <form className={styles.searchForm} onSubmit={handleFilterSubmit}>
          <input 
            type="text" 
            placeholder="Buscar por nombre de hotel..." 
            value={filters.hotelName}
            onChange={(e) => setFilters({...filters, hotelName: e.target.value})}
          />
          <select 
            value={filters.type} 
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">Cualquier tipo</option>
            <option value="SINGLE">Individual</option>
            <option value="DOUBLE">Doble</option>
            <option value="SUITE">Suite</option>
          </select>
          <button type="submit" className="btn-primary">Buscar</button>
        </form>

        <div className={styles.grid}>
          {rooms.length === 0 ? (
            <p>No se encontraron habitaciones con esos criterios.</p>
          ) : (
            rooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                userRole={user.role} 
                onReserve={() => navigate(`/hotel/${room.hotelId}`)}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // Vista MANAGER y ADMIN
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Panel de Control ({user.role})</h1>
        <p>Bienvenido de nuevo, {user.name}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Pendientes</h3>
          <p className={styles.statNumber} style={{ color: 'var(--status-pending)' }}>{stats.pending}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Confirmadas</h3>
          <p className={styles.statNumber} style={{ color: 'var(--status-confirmed)' }}>{stats.confirmed}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Canceladas</h3>
          <p className={styles.statNumber} style={{ color: 'var(--status-cancelled)' }}>{stats.cancelled}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>
        {user.role === 'MANAGER' ? 'Mis Hoteles' : 'Todos los Hoteles'}
      </h2>
      
      <div className={styles.grid}>
        {hotels.length === 0 ? (
          <p>No hay hoteles registrados.</p>
        ) : (
          hotels.map(hotel => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;
