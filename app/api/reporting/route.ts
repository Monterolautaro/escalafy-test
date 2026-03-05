import { NextRequest, NextResponse } from 'next/server';
import { getReport, VALID_METRICS } from '@/lib/reporting';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const orgIdRaw = searchParams.get('orgId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const metricsRaw = searchParams.get('metrics');

    if (!orgIdRaw || !startDate || !endDate || !metricsRaw) {
        return NextResponse.json(
            { error: 'Parámetros requeridos: orgId, startDate, endDate, metrics' },
            { status: 400 }
        );
    }

    const orgId = parseInt(orgIdRaw);
    if (isNaN(orgId)) {
        return NextResponse.json(
            { error: 'orgId debe ser un número entero' },
            { status: 400 }
        );
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return NextResponse.json(
            { error: 'startDate y endDate deben tener formato YYYY-MM-DD' },
            { status: 400 }
        );
    }

    if (startDate > endDate) {
        return NextResponse.json(
            { error: 'startDate no puede ser posterior a endDate' },
            { status: 400 }
        );
    }

    const metrics = metricsRaw.split(',').map((metric) => metric.trim()).filter(Boolean);
    const invalidMetrics = metrics.filter((mmetric) => !VALID_METRICS.includes(mmetric as never));

    if (invalidMetrics.length > 0) {
        return NextResponse.json(
            {
                error: `Métricas no válidas: ${invalidMetrics.join(', ')}`,
                validMetrics: VALID_METRICS,
            },
            { status: 400 }
        );
    }

    try {
        const result = await getReport({ orgId, startDate, endDate, metrics });
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Error interno';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
