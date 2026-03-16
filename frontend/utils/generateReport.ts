import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SensorData } from '@/hooks/useSensorData';
import { sites } from '@/data/sites';


interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number };
}

function getStatus(param: string, value: number, swayTolerance: number = 30): string {
    if (param === 'Sway') {
        const warningThreshold = swayTolerance;
        const criticalThreshold = swayTolerance * (50 / 30);
        if (value > swayTolerance + 20) return 'CRITICAL';
        if (value > swayTolerance) return 'WARNING';
        return 'NORMAL';
    }
    if (param === 'Total Tilt') {
        if (value > 0.280) return 'CRITICAL';
        if (value > 0.2) return 'WARNING';
        return 'NORMAL';
    }
    if (param === 'Wind Speed') {
        if (value > 35) return 'CRITICAL';
        if (value > 22) return 'WARNING';
        return 'NORMAL';
    }
    return 'NORMAL';
}

function getStatusColor(status: string): [number, number, number] {
    if (status === 'CRITICAL') return [220, 38, 38];
    if (status === 'WARNING') return [234, 179, 8];
    return [34, 197, 94];
}

interface SiteInfo {
    name?: string;
    deviceId?: string;
    towerType?: string;
    towerHeight?: number;
}

export function generateReport(latest: SensorData | null, history: SensorData[], startDate?: Date | null, endDate?: Date | null, siteInfo?: SiteInfo) {
    const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const now = new Date();
    const primary: [number, number, number] = [15, 23, 42];
    const accent: [number, number, number] = [14, 165, 233];
    const headerBg: [number, number, number] = [30, 41, 59];
    const lightGray: [number, number, number] = [241, 245, 249];
    const textDark: [number, number, number] = [30, 41, 59];
    const textMuted: [number, number, number] = [100, 116, 139];
    doc.setFillColor(...primary);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(...accent);
    doc.rect(0, 45, pageWidth, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Structural Health Monitoring', margin, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('System Report', margin, 26);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Report Generated:', pageWidth - margin, 14, { align: 'right' });
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 20, { align: 'right' });
    doc.text(now.toLocaleTimeString('id-ID'), pageWidth - margin, 26, { align: 'right' });
    if (startDate || endDate) {
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        const rangeStart = startDate ? startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'All';
        const rangeEnd = endDate ? endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Now';
        doc.text(`Period: ${rangeStart} — ${rangeEnd}`, pageWidth - margin, 32, { align: 'right' });
    }
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const siteName = siteInfo?.name ?? 'SHM Site';
    const siteDeviceId = siteInfo?.deviceId ?? latest?.device_id ?? '-';
    const siteObj = sites.find(s => s.code === siteDeviceId);
    const siteTowerType = siteObj?.towerType ?? siteInfo?.towerType ?? 'Monopole';
    const siteTowerHeight = siteObj?.towerHeight ?? siteInfo?.towerHeight ?? 6;
    const badges = [`Site: ${siteName}`, `Device: ${siteDeviceId}`, `Type: ${siteTowerType}`];
    let badgeX = margin;
    badges.forEach(badge => {
        const w = doc.getTextWidth(badge) + 6;
        doc.setFillColor(51, 65, 85);
        doc.roundedRect(badgeX, 33, w, 7, 1.5, 1.5, 'F');
        doc.setTextColor(203, 213, 225);
        doc.text(badge, badgeX + 3, 37.5);
        badgeX += w + 3;
    });

    let y = 55;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Executive Summary', margin, y);
    doc.setFillColor(...accent);
    doc.rect(margin, y + 2, 25, 0.8, 'F');
    y += 10;

    const swayVal = latest?.sway ?? 0;
    const tiltVal = latest?.total_tilt ?? 0;
    const windVal = latest?.wind_speed ?? 0;

    const swayTolerance = siteTowerHeight * 5;

    const swayWarning = swayVal > swayTolerance;
    const swayCritical = swayVal > (swayTolerance + 20);
    const tiltWarning = tiltVal > 0.280;
    const warningCount = (swayWarning ? 1 : 0) + (tiltWarning ? 1 : 0);
    const criticalCount = swayCritical ? 1 : 0;
    const systemStatus = criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'ALL CLEAR';

    const cardWidth = (contentWidth - 6) / 3;
    const cards = [
        { label: 'System Status', value: systemStatus, color: getStatusColor(systemStatus) },
        { label: 'Warnings', value: warningCount.toString(), color: [234, 179, 8] as [number, number, number] },
        { label: 'Critical', value: criticalCount.toString(), color: [220, 38, 38] as [number, number, number] },
    ];

    cards.forEach((card, i) => {
        const cx = margin + i * (cardWidth + 3);
        doc.setFillColor(...lightGray);
        doc.roundedRect(cx, y, cardWidth, 18, 2, 2, 'F');

        doc.setFillColor(...card.color);
        doc.rect(cx, y + 3, 1.2, 12, 'F');

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textMuted);
        doc.text(card.label, cx + 5, y + 7);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...card.color);
        doc.text(card.value, cx + 5, y + 14.5);
    });

    y += 26;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    const dateRangeText = (startDate || endDate)
        ? `Period: ${startDate ? startDate.toLocaleDateString('id-ID') : 'Start'} — ${endDate ? endDate.toLocaleDateString('id-ID') : 'Now'}`
        : 'All available data';
    const dataInfo = `Total data points: ${history.length} | ${dateRangeText} | Sensors active: ${latest ? 7 : 0}`;
    doc.text(dataInfo, margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Current Sensor Readings', margin, y);
    doc.setFillColor(...accent);
    doc.rect(margin, y + 2, 25, 0.8, 'F');
    y += 6;

    if (latest) {
        const lastTime = new Date(latest.timestamp);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textMuted);
        doc.text(`Last reading: ${lastTime.toLocaleString('id-ID')}`, margin, y + 2);
        y += 4;
    }

    const sensorRows = latest ? [
        ['Wind Speed', `${latest.wind_speed.toFixed(2)} knot\n(${latest.wind_speed_ms.toFixed(2)} m/s)`, '0 - 35 knot', getStatus('Wind Speed', latest.wind_speed)],
        ['Pitch', `${latest.pitch.toFixed(3)}°`, '-90° to 90°', 'NORMAL'],
        ['Roll', `${latest.roll.toFixed(3)}°`, '-90° to 90°', 'NORMAL'],
        ['Tilt Rate', `${latest.tilt_rate.toFixed(4)}°`, '0° - 1°', 'NORMAL'],
        ['Sway', `${latest.sway.toFixed(1)} mm`, `Toleransi: ${swayTolerance} mm`, getStatus('Sway', latest.sway, swayTolerance)],
        ['Total Tilt', `${latest.total_tilt.toFixed(4)}°`, 'Toleransi: 0.280°', getStatus('Total Tilt', latest.total_tilt)],
    ] : [['No data available', '-', '-', '-']];

    autoTable(doc, {
        startY: y + 2,
        head: [['Parameter', 'Current Value', 'Range / Threshold', 'Status']],
        body: sensorRows,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: textDark,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: headerBg,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: {
            3: { fontStyle: 'bold' },
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 3) {
                const val = data.cell.raw as string;
                if (val === 'CRITICAL') data.cell.styles.textColor = [220, 38, 38];
                else if (val === 'WARNING') data.cell.styles.textColor = [234, 179, 8];
                else if (val === 'NORMAL') data.cell.styles.textColor = [34, 197, 94];
            }
        },
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Trend Analysis Data', margin, y);
    doc.setFillColor(...accent);
    doc.rect(margin, y + 2, 25, 0.8, 'F');
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    const dateDesc = (startDate || endDate)
        ? `Filtered data: ${startDate ? startDate.toLocaleDateString('id-ID') : 'Start'} — ${endDate ? endDate.toLocaleDateString('id-ID') : 'Now'}`
        : 'All sensor readings sorted by most recent';
    doc.text(`${dateDesc} (${history.length} records)`, margin, y + 3);
    y += 4;

    const trendData = history;
    const trendRows = trendData.map(d => {
        const t = new Date(d.timestamp);
        return [
            t.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            t.toLocaleTimeString('id-ID'),
            d.wind_speed.toFixed(2),
            d.pitch.toFixed(3),
            d.roll.toFixed(3),
            d.tilt_rate.toFixed(4),
            d.sway.toFixed(1),
            d.total_tilt.toFixed(4),
        ];
    });

    autoTable(doc, {
        startY: y + 2,
        head: [['Date', 'Time', 'Wind (knot)', 'Pitch (°)', 'Roll (°)', 'Tilt Rate (°)', 'Sway (mm)', 'Total Tilt (°)']],
        body: trendRows,
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 7,
            cellPadding: 2.2,
            textColor: textDark,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
            halign: 'center',
        },
        headStyles: {
            fillColor: headerBg,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
    });

    y = doc.lastAutoTable.finalY + 10;

    if (y > 250) {
        doc.addPage();
        y = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    doc.text('Parameter Change History', margin, y);
    doc.setFillColor(...accent);
    doc.rect(margin, y + 2, 25, 0.8, 'F');
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(`Significant parameter changes between consecutive readings (${trendData.length} records)`, margin, y + 3);
    y += 4;

    const paramKeys = ['wind_speed', 'pitch', 'roll', 'sway', 'total_tilt'] as const;
    const paramNames: Record<string, string> = {
        wind_speed: 'Wind Speed', pitch: 'Pitch', roll: 'Roll', sway: 'Sway', total_tilt: 'Total Tilt'
    };
    const paramUnits: Record<string, string> = {
        wind_speed: 'knot', pitch: '°', roll: '°', sway: 'mm', total_tilt: '°'
    };

    const changeRows: string[][] = [];
    for (let i = 0; i < trendData.length - 1 && changeRows.length < 50; i++) {
        const curr = trendData[i];
        const prev = trendData[i + 1];

        let biggestParam: typeof paramKeys[number] = paramKeys[0];
        let biggestDiff = 0;
        for (const p of paramKeys) {
            const diff = Math.abs(curr[p] - prev[p]);
            if (diff > biggestDiff) { biggestDiff = diff; biggestParam = p; }
        }

        const paramName = paramNames[biggestParam];
        const unit = paramUnits[biggestParam];
        const currVal = curr[biggestParam];
        const prevVal = prev[biggestParam];
        const diff = currVal - prevVal;
        const decimals = biggestParam === 'sway' ? 0 : biggestParam === 'wind_speed' ? 2 : biggestParam === 'total_tilt' ? 4 : 3;

        const t = new Date(curr.timestamp);
        changeRows.push([
            `${t.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' })} ${t.toLocaleTimeString('id-ID')}`,
            paramName,
            `${prevVal.toFixed(decimals)} ${unit}`,
            `${currVal.toFixed(decimals)} ${unit}`,
            `${diff >= 0 ? '+' : ''}${diff.toFixed(decimals)} ${unit}`,
            getStatus(paramName, currVal, swayTolerance),
        ]);
    }

    autoTable(doc, {
        startY: y + 2,
        head: [['Date & Time', 'Parameter', 'Previous', 'Current', 'Change', 'Status']],
        body: changeRows.length > 0 ? changeRows : [['No change data available', '-', '-', '-', '-', '-']],
        margin: { left: margin, right: margin },
        styles: {
            fontSize: 7,
            cellPadding: 2.5,
            textColor: textDark,
            lineColor: [226, 232, 240],
            lineWidth: 0.2,
        },
        headStyles: {
            fillColor: headerBg,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw as string;
                if (val === 'CRITICAL') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.fontStyle = 'bold'; }
                else if (val === 'WARNING') { data.cell.styles.textColor = [234, 179, 8]; data.cell.styles.fontStyle = 'bold'; }
                else if (val === 'NORMAL') { data.cell.styles.textColor = [34, 197, 94]; data.cell.styles.fontStyle = 'bold'; }
            }
            if (data.section === 'body' && data.column.index === 4) {
                const val = data.cell.raw as string;
                if (val.startsWith('+')) data.cell.styles.textColor = [220, 38, 38];
                else if (val.startsWith('-')) data.cell.styles.textColor = [34, 197, 94];
            }
        },
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, pageH - 12, pageWidth - margin, pageH - 12);

        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textMuted);
        doc.text(`Auto-generated report · Structural Health Monitoring System · ${siteName} (${siteDeviceId})`, margin, pageH - 7);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageH - 7, { align: 'right' });
    }

    const deviceTag = siteInfo?.deviceId ? `_${siteInfo.deviceId}` : '';
    const filename = `SHM_Report${deviceTag}_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.pdf`;
    doc.save(filename);
}
