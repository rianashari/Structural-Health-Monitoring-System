'use client';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8000/api';

export interface SensorData {
    id: number;
    timestamp: string;
    wind_speed: number;
    pitch: number;
    roll: number;
    tilt_rate: number;
    sway: number;
    total_tilt: number;
}

export function useSensorData(refreshInterval = 5000) {
    const [latest, setLatest] = useState<SensorData | null>(null);
    const [history, setHistory] = useState<SensorData[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [latestRes, historyRes] = await Promise.all([
                fetch(`${API_BASE}/sensor-data/latest/`),
                fetch(`${API_BASE}/sensor-data/history/?limit=100`),
            ]);

            if (latestRes.ok) {
                const latestData = await latestRes.json();
                setLatest(latestData);
                setIsConnected(true);
            }

            if (historyRes.ok) {
                const historyData = await historyRes.json();
                setHistory(historyData);
            }
        } catch {
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchData, refreshInterval]);

    return { latest, history, isConnected };
}
