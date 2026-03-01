'use client';
import { useState, useEffect } from 'react';
import { History, Wind, ArrowRightLeft, Droplet, ArrowUp, ArrowDown, Activity, Compass } from 'lucide-react';

const initialData = [
    {
        id: 1,
        date: 'Mon, Mar 2, 2026',
        time: '00:05:09',
        ago: '2s ago',
        param: 'Sway',
        icon: <ArrowRightLeft size={12} />,
        prev: '52 mm',
        curr: '61 mm',
        change: '+9 mm',
        changeType: 'up',
        status: 'Critical',
        color: 'red'
    },
    {
        id: 2,
        date: 'Mon, Mar 2, 2026',
        time: '00:04:57',
        ago: '14s ago',
        param: 'Wind Speed',
        icon: <Wind size={12} />,
        prev: '1.24 knot',
        curr: '3.87 knot',
        change: '+2.63 knot',
        changeType: 'up',
        status: 'Normal',
        color: 'green'
    },
    {
        id: 3,
        date: 'Mon, Mar 2, 2026',
        time: '00:04:45',
        ago: '26s ago',
        param: 'Wind Speed',
        icon: <Wind size={12} />,
        prev: '3.87 knot',
        curr: '2.05 knot',
        change: '-1.82 knot',
        changeType: 'down',
        status: 'Normal',
        color: 'green'
    },
    {
        id: 4,
        date: 'Sun, Mar 1, 2026',
        time: '23:59:33',
        ago: '5m ago',
        param: 'Pitch',
        icon: <Compass size={12} />,
        prev: '0.12 °',
        curr: '0.19 °',
        change: '+0.07 °',
        changeType: 'up',
        status: 'Normal',
        color: 'green'
    },
    {
        id: 5,
        date: 'Sun, Mar 1, 2026',
        time: '23:45:21',
        ago: '20m ago',
        param: 'Total Tilt',
        icon: <Droplet size={12} />,
        prev: '0.057 °',
        curr: '0.049 °',
        change: '-0.01 °',
        changeType: 'down',
        status: 'Normal',
        color: 'green'
    },
    {
        id: 6,
        date: 'Sat, Feb 28, 2026',
        time: '14:20:00',
        ago: '2d ago',
        param: 'Sway',
        icon: <ArrowRightLeft size={12} />,
        prev: '28 mm',
        curr: '35 mm',
        change: '+7 mm',
        changeType: 'up',
        status: 'Warning',
        color: 'yellow'
    }
];

const newEventsPool = [
    { param: 'Wind Speed', icon: <Wind size={12} />, prev: '2.05 knot', curr: '2.18 knot', change: '+0.13 knot', changeType: 'up', status: 'Normal', color: 'green' },
    { param: 'Sway', icon: <ArrowRightLeft size={12} />, prev: '61 mm', curr: '58 mm', change: '-3 mm', changeType: 'down', status: 'Warning', color: 'yellow' },
    { param: 'Pitch', icon: <Compass size={12} />, prev: '0.19 °', curr: '0.21 °', change: '+0.02 °', changeType: 'up', status: 'Normal', color: 'green' },
    { param: 'Total Tilt', icon: <Droplet size={12} />, prev: '0.049 °', curr: '0.051 °', change: '+0.002 °', changeType: 'up', status: 'Normal', color: 'green' },
    { param: 'Sway', icon: <ArrowRightLeft size={12} />, prev: '58 mm', curr: '64 mm', change: '+6 mm', changeType: 'up', status: 'Critical', color: 'red' },
];

export default function HistoryTable() {
    const [events, setEvents] = useState(initialData);

    useEffect(() => {
        // Simulate new data streaming in every 5 seconds
        const interval = setInterval(() => {
            const randomEvent = newEventsPool[Math.floor(Math.random() * newEventsPool.length)];

            const now = new Date();
            const timeString = now.toTimeString().split(' ')[0];
            const dateString = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            const newEntry = {
                id: Date.now(),
                date: dateString,
                time: timeString,
                ago: 'just now',
                ...randomEvent
            };

            setEvents(prev => {
                // Keep up to 100 events to simulate 30 days retention, adding new events to the top
                const updated = [newEntry, ...prev].slice(0, 100);

                // Update the "ago" text for existing events to reflect time passing
                return updated.map(event => {
                    if (event.id === newEntry.id) return event;
                    if (event.ago === 'just now') return { ...event, ago: '5s ago' };
                    if (event.ago === '5s ago') return { ...event, ago: '10s ago' };
                    if (event.ago === '10s ago') return { ...event, ago: '15s ago' };
                    if (event.ago === '15s ago') return { ...event, ago: '20s ago' };
                    return event;
                });
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const normalCount = events.filter(e => e.color === 'green').length;
    const warningCount = events.filter(e => e.color === 'yellow').length;
    const criticalCount = events.filter(e => e.color === 'red').length;

    return (
        <div className="history-section flex-col" style={{ display: 'flex', height: '100%' }}>

            <div className="section-header" style={{ marginBottom: '1.25rem' }}>
                <div className="section-title-wrap">
                    <div className="section-icon" style={{ color: 'var(--text-secondary)', background: 'transparent', width: 'auto', height: 'auto', border: 'none', paddingRight: '0.25rem' }}>
                        <History size={20} />
                    </div>
                    <div className="flex-col" style={{ gap: '0.1rem' }}>
                        <h3 className="section-title" style={{ fontSize: '0.875rem' }}>Parameter Change History</h3>
                        <p className="section-subtitle">Retaining history for up to 30 days · auto-refresh every 5s</p>
                    </div>
                </div>
                <div className="badge online flex items-center gap-1.5" style={{ padding: '0.2rem 0.6rem' }}>
                    <div className="status-dot green"></div> <span style={{ fontSize: '0.65rem' }}>Live</span>
                </div>
            </div>

            <div className="history-tabs flex justify-between items-center">
                <div className="flex gap-2">
                    <button className="history-tab active">
                        All <span className="tab-count gray">{events.length}</span>
                    </button>
                    <button className="history-tab">
                        Normal <span className="tab-count green">{normalCount}</span>
                    </button>
                    <button className="history-tab">
                        Warning <span className="tab-count yellow">{warningCount}</span>
                    </button>
                    <button className="history-tab">
                        Critical <span className="tab-count red">{criticalCount}</span>
                    </button>
                </div>
                <div className="text-tertiary" style={{ fontSize: '0.65rem' }}>Showing {events.length} events</div>
            </div>

            {/* Scrollable Table Container */}
            <div className="table-scroll-container" style={{
                maxHeight: '350px',
                overflowY: 'auto',
                paddingRight: '0.5rem',
                flex: 1
            }}>
                <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                        <tr>
                            <th>DATE & TIME</th>
                            <th>PARAMETER</th>
                            <th>PREVIOUS</th>
                            <th>CURRENT</th>
                            <th>CHANGE</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    <div className="time-col gap-0.5">
                                        <span className="text-tertiary" style={{ fontSize: '0.6rem', fontWeight: 500 }}>{row.date}</span>
                                        <div className="flex items-baseline gap-3">
                                            <span className="font-mono text-primary" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.time}</span>
                                            <span className="text-tertiary" style={{ fontSize: '0.6rem' }}>{row.ago}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="param-name text-secondary">
                                        <div className="param-icon-wrap">{row.icon}</div>
                                        {row.param}
                                    </div>
                                </td>
                                <td className="text-tertiary font-mono" style={{ fontSize: '0.75rem' }}>{row.prev}</td>
                                <td className="font-mono text-primary" style={{ fontWeight: 700, fontSize: '0.75rem' }}>{row.curr}</td>
                                <td>
                                    <div className={`change-val ${row.changeType === 'down' ? 'text-green' : 'text-red'}`}>
                                        {row.changeType === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {row.change}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${row.color}`}>
                                        <div className={`status-dot ${row.color}`}></div> {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.75rem' }}>
                <div className="flex gap-6">
                    <span className="flex items-center" style={{ gap: '0.375rem' }}><div className="status-dot green"></div> <span className="text-secondary">{normalCount} normal</span></span>
                    <span className="flex items-center" style={{ gap: '0.375rem' }}><div className="status-dot yellow"></div> <span className="text-secondary">{warningCount} warning</span></span>
                    <span className="flex items-center" style={{ gap: '0.375rem' }}><div className="status-dot red"></div> <span className="text-secondary">{criticalCount} critical</span></span>
                </div>
                <div className="text-tertiary" style={{ fontSize: '0.7rem' }}>Auto-updating · new events appear at top</div>
            </div>
        </div>
    );
}
