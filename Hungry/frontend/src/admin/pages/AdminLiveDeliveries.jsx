import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  FaMotorcycle,
  FaStore,
  FaLocationDot,
  FaPhone,
  FaReceipt,
  FaCircleDot,
  FaArrowsRotate
} from 'react-icons/fa6';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import scooterImg from '../../assets/scooter.png';
import homeImg from '../../assets/home.png';
import shopImg from '../../assets/shop.png';
import StatusBadge from '../components/StatusBadge';

const riderIcon = new L.Icon({
  iconUrl: scooterImg,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -36]
});

const customerIcon = new L.Icon({
  iconUrl: homeImg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34]
});

const shopIcon = new L.Icon({
  iconUrl: shopImg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34]
});

function MapPanHandler({ targetCoords }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords && targetCoords[0] && targetCoords[1]) {
      map.flyTo(targetCoords, 16, { duration: 1.2 });
    }
  }, [targetCoords, map]);
  return null;
}

export default function AdminLiveDeliveries() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeRiders, setActiveRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchLiveDeliveries();

    // Connect to socket for live updates
    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('orderStatusUpdate', () => {
      fetchLiveDeliveries();
    });

    socket.on('newOrder', () => {
      fetchLiveDeliveries();
    });

    socket.on('riderLocationUpdate', (data) => {
      if (!data?.riderId || !data.coordinates) return;
      setActiveRiders((prev) =>
        prev.map((r) =>
          r._id === data.riderId
            ? { ...r, location: { ...r.location, coordinates: data.coordinates } }
            : r
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLiveDeliveries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/deliveries/live', { withCredentials: true });
      if (res.data?.success) {
        setActiveOrders(res.data.data.activeOrders || []);
        setActiveRiders(res.data.data.activeRiders || []);
      }
    } catch (err) {
      console.error('Failed to load live deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  // Center coordinate determination (fallback: Pune / Mumbai coords or first order)
  const defaultCenter = [18.5204, 73.8567]; // default center
  const initialCenter = activeOrders[0]?.deliveryAddress?.coordinates?.length === 2
    ? [activeOrders[0].deliveryAddress.coordinates[1], activeOrders[0].deliveryAddress.coordinates[0]]
    : defaultCenter;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Live Dispatch & Delivery Radar</span>
          </h1>
          <p className="text-sm text-slate-500">
            Real-time GPS tracking of active riders, orders in transit, and restaurant origins
          </p>
        </div>
        <button
          onClick={fetchLiveDeliveries}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <FaArrowsRotate className={loading ? 'animate-spin' : ''} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Leaflet Map (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <img src={scooterImg} alt="Rider" className="w-4 h-4 object-contain" />
                <span>Riders Online ({activeRiders.length})</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <img src={homeImg} alt="Customer" className="w-4 h-4 object-contain" />
                <span>Orders In-Flight ({activeOrders.length})</span>
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">Real-time Leaflet GIS</span>
          </div>

          <div className="flex-1 w-full relative z-0">
            <MapContainer
              center={initialCenter}
              zoom={13}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapPanHandler targetCoords={selectedCoords} />

              {/* Delivery Partner Markers */}
              {activeRiders.map((rider) => {
                const coords = rider.location?.coordinates;
                if (!coords || coords.length !== 2 || (coords[0] === 0 && coords[1] === 0)) return null;
                const pos = [coords[1], coords[0]]; // [lat, lon]

                return (
                  <Marker key={rider._id} position={pos} icon={riderIcon}>
                    <Popup>
                      <div className="text-xs p-1">
                        <div className="font-bold text-slate-900">{rider.fullName}</div>
                        <div className="text-slate-500">{rider.mobile || 'No contact'}</div>
                        <div className="mt-1 font-semibold uppercase text-emerald-600">
                          {rider.riderStatus || 'Available'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* Active Orders Markers (Customer & Shop) */}
              {activeOrders.map((ord) => {
                const custCoords = ord.deliveryAddress?.coordinates;
                const hasCust = custCoords && custCoords.length === 2 && custCoords[0] !== 0;
                const custPos = hasCust ? [custCoords[1], custCoords[0]] : null;

                const shopCoords = ord.shop?.location?.coordinates;
                const hasShop = shopCoords && shopCoords.length === 2 && shopCoords[0] !== 0;
                const shopPos = hasShop ? [shopCoords[1], shopCoords[0]] : null;

                return (
                  <React.Fragment key={ord._id}>
                    {custPos && (
                      <Marker position={custPos} icon={customerIcon}>
                        <Popup>
                          <div className="text-xs p-1">
                            <div className="font-bold text-slate-900">Order #{ord._id.slice(-6).toUpperCase()}</div>
                            <div className="text-slate-600">Customer: {ord.user?.fullName}</div>
                            <div className="text-slate-600">Total: ₹{ord.totalAmount}</div>
                            <div className="mt-1 font-medium capitalize text-orange-600">Status: {ord.status}</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {shopPos && (
                      <Marker position={shopPos} icon={shopIcon}>
                        <Popup>
                          <div className="text-xs p-1">
                            <div className="font-bold text-slate-900">{ord.shop?.name}</div>
                            <div className="text-slate-500">Origin Restaurant</div>
                          </div>
                        </Popup>
                      </Marker>
                    )}

                    {custPos && shopPos && (
                      <Polyline
                        positions={[shopPos, custPos]}
                        pathOptions={{ color: '#f97316', weight: 3, opacity: 0.6, dashArray: '6 8' }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Live Orders Feed (1 Col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Deliveries ({activeOrders.length})</h2>
            <p className="text-xs text-slate-500">Live order lifecycle stream</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {activeOrders.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No orders currently in preparation or transit.
              </div>
            ) : (
              activeOrders.map((ord) => {
                const custCoords = ord.deliveryAddress?.coordinates;
                const hasCoords = custCoords && custCoords.length === 2 && custCoords[0] !== 0;

                return (
                  <div
                    key={ord._id}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedOrder?._id === ord._id
                        ? 'border-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                    onClick={() => {
                      setSelectedOrder(ord);
                      if (hasCoords) {
                        setSelectedCoords([custCoords[1], custCoords[0]]);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{ord._id.slice(-6).toUpperCase()}
                      </span>
                      <StatusBadge status={ord.status} />
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <FaStore className="text-orange-500 text-[10px]" />
                        <span className="truncate">{ord.shop?.name || 'Restaurant'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaLocationDot className="text-slate-400 text-[10px]" />
                        <span className="truncate">{ord.deliveryAddress?.address || ord.user?.fullName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaMotorcycle className="text-blue-500 text-[10px]" />
                        <span>Rider: {ord.assignedRider?.fullName || 'Searching nearest partner...'}</span>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">₹{ord.totalAmount}</span>
                      {hasCoords && (
                        <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline">
                          Locate on Map →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
