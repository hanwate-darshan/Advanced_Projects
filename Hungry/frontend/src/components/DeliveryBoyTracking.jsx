import React, { useEffect } from 'react'
import scooter from "../assets/scooter.png"
import home from "../assets/home.png"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

const deliveryBoyIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 36]
})

function MapBoundsUpdater({ bounds, center }) {
    const map = useMap()
    useEffect(() => {
        if (!map) return
        if (bounds && bounds.length === 2 && bounds[0][0] && bounds[1][0]) {
            try {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 })
            } catch (e) {
                if (center) map.setView(center, 15)
            }
        } else if (center) {
            map.setView(center, 15)
        }
    }, [bounds, center, map])
    return null
}

function DeliveryBoyTracking({ data }) {
    const customerLat = Number(data?.customerLocation?.lat) || 18.5204
    const customerlon = Number(data?.customerLocation?.lon) || 73.8567

    let boyLat = Number(data?.deliveryBoyLocation?.lat)
    let boyLon = Number(data?.deliveryBoyLocation?.lon)

    const isBoyValid = boyLat && boyLon && !(boyLat === 0 && boyLon === 0)
    if (!isBoyValid) {
        // Place delivery boy nearby customer (~500m offset) if GPS is uninitialized or 0,0 for visual demo
        boyLat = customerLat + 0.005
        boyLon = customerlon + 0.005
    }

    const path = [
        [boyLat, boyLon],
        [customerLat, customerlon]
    ]

    const center = [(boyLat + customerLat) / 2, (boyLon + customerlon) / 2]

    return (
        <div className='w-full h-[400px] mt-3 rounded-2xl overflow-hidden shadow-sm border border-blinkit-border-light relative'>
            <MapContainer
                className="w-full h-full"
                center={center}
                zoom={15}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[boyLat, boyLon]} icon={deliveryBoyIcon}>
                    <Popup>
                        <div className="text-xs font-bold text-blinkit-text">
                            🛵 Delivery Partner
                            <p className="font-normal text-blinkit-text-muted mt-0.5">On the way to deliver</p>
                        </div>
                    </Popup>
                </Marker>
                <Marker position={[customerLat, customerlon]} icon={customerIcon}>
                    <Popup>
                        <div className="text-xs font-bold text-blinkit-text">
                            📍 Delivery Location
                            <p className="font-normal text-blinkit-text-muted mt-0.5">Customer address</p>
                        </div>
                    </Popup>
                </Marker>

                <Polyline positions={path} pathOptions={{ color: '#F0410F', weight: 4, opacity: 0.85, dashArray: '8 10' }} className='tracking-dash' />
                <MapBoundsUpdater bounds={path} center={center} />
            </MapContainer>
        </div>
    )
}

export default DeliveryBoyTracking
