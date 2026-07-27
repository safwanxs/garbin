import React, { useEffect, useRef } from 'react';

export default function MapView({ bins = [], route = null, onSelectBin, onPickupBin }) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routePolylineRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return; // Initialize once

    if (window.L) {
      const map = window.L.map(mapContainerRef.current, {
        center: [12.96, 77.63],
        zoom: 12,
        zoomControl: true
      });

      // Dark futuristic tile layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Garbin Municipal GIS',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = window.L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }
  }, []);

  // Update Markers & Route lines when bins or route state change
  useEffect(() => {
    if (!leafletMapRef.current || !window.L || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (routePolylineRef.current) {
      leafletMapRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    // Add markers for bins
    bins.forEach(bin => {
      const { lat, lng } = bin.location || { lat: 12.9716, lng: 77.5946 };
      
      let markerColor = '#10b981'; // Green
      let statusLabel = 'NORMAL';
      let pulseClass = '';

      if (bin.status === 'overflowing') {
        markerColor = '#ef4444'; // Red
        statusLabel = 'OVERFLOWING';
        pulseClass = 'pulse-danger';
      } else if (bin.predictiveFlag) {
        markerColor = '#f59e0b'; // Yellow
        statusLabel = 'HIGH RISK';
        pulseClass = 'pulse-warning';
      }

      const customIcon = window.L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="map-marker-pin ${pulseClass}" style="background-color: ${markerColor};">
            <span class="marker-dot"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'map-popup-card';
      popupContent.innerHTML = `
        <div class="popup-header">
          <span class="popup-badge" style="background:${markerColor}22; color:${markerColor}; border: 1px solid ${markerColor};">
            ${statusLabel}
          </span>
          <h4>${bin.id}</h4>
        </div>
        <p class="popup-address"><strong>Location:</strong> ${bin.address}</p>
        <p class="popup-meta"><strong>Capacity:</strong> ${bin.capacity || '1100L'}</p>
        <p class="popup-meta"><strong>Last Pickup:</strong> ${bin.daysSinceLastPickup !== undefined ? `${bin.daysSinceLastPickup} days ago` : '4 days ago'}</p>
        ${bin.riskReason ? `<div class="popup-risk-alert">${bin.riskReason}</div>` : ''}
        <div class="popup-actions">
          <button id="btn-pickup-${bin.id}" class="popup-btn-pickup">
            Mark Picked Up
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-pickup-${bin.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onPickupBin) onPickupBin(bin.id);
            marker.closePopup();
          };
        }
        if (onSelectBin) onSelectBin(bin);
      });

      markersGroupRef.current.addLayer(marker);
    });

    // Draw route polyline if an active route exists
    if (route) {
      let routeCoords = [];

      if (route.polylineCoords && route.polylineCoords.length > 0) {
        routeCoords = route.polylineCoords;
      } else if (route.stopSequence && route.stopSequence.length > 1) {
        route.stopSequence.forEach(stopId => {
          const foundBin = bins.find(b => b.id === stopId);
          if (foundBin && foundBin.location) {
            routeCoords.push([foundBin.location.lat, foundBin.location.lng]);
          }
        });
      }

      if (routeCoords.length > 1) {
        routePolylineRef.current = window.L.polyline(routeCoords, {
          color: '#0284c7',
          weight: 5,
          opacity: 0.9,
          lineCap: 'round'
        }).addTo(leafletMapRef.current);

        leafletMapRef.current.fitBounds(routePolylineRef.current.getBounds(), { padding: [40, 40] });
      }
    }
  }, [bins, route, onSelectBin, onPickupBin]);

  return (
    <div className="map-view-wrapper">
      <div ref={mapContainerRef} className="map-leaflet-container" />
      <div className="map-legend">
        <div className="legend-item"><span className="dot normal"></span> Normal (&lt;70% fill)</div>
        <div className="legend-item"><span className="dot warning"></span> Predictive High-Risk (Heuristic Alert)</div>
        <div className="legend-item"><span className="dot danger"></span> Active Overflow (Resident Verified)</div>
      </div>
    </div>
  );
}
