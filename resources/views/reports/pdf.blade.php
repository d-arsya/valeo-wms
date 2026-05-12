<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>WMS Activity Report</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 11pt;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #005596;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #005596;
            margin: 0;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0;
            font-size: 9pt;
            color: #666;
        }
        .filters {
            margin-bottom: 20px;
            font-size: 9pt;
            background: #f9f9f9;
            padding: 10px;
            border: 1px solid #ddd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #005596;
            color: white;
            text-align: left;
            padding: 8px;
            font-size: 9pt;
        }
        td {
            border-bottom: 1px solid #ddd;
            padding: 8px;
            font-size: 8pt;
        }
        .badge {
            padding: 3px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 7pt;
        }
        .badge-in { background-color: #dcfce7; color: #166534; }
        .badge-out { background-color: #fee2e2; color: #991b1b; }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 8pt;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Valeo WMS - Activity Report</h1>
        <p>Generated at: {{ $generated_at }}</p>
    </div>

    <div class="filters">
        <strong>Filters Applied:</strong>
        @if(!empty($filters['from']) || !empty($filters['to']))
            Date: {{ $filters['from'] ?? 'Start' }} to {{ $filters['to'] ?? 'End' }} |
        @endif
        @if(!empty($filters['type']))
            Type: {{ strtoupper($filters['type']) }} |
        @endif
        @if(!empty($filters['control_id']))
            Control ID: {{ $filters['control_id'] }} |
        @endif
        @if(!empty($filters['search']))
            Search: "{{ $filters['search'] }}"
        @endif
        @if(empty(array_filter($filters)))
            None
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Control ID</th>
                <th>Type</th>
                <th>Material Number</th>
                <th>Part Name</th>
                <th>Qty</th>
                <th>PIC</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($logs as $log)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($log->performed_at)->format('d/m/Y H:i') }}</td>
                    <td><code>{{ $log->control_id }}</code></td>
                    <td>
                        <span class="badge badge-{{ strtolower($log->type) }}">
                            {{ $log->type }}
                        </span>
                    </td>
                    <td>{{ $log->sparepart->material_number }}</td>
                    <td>{{ $log->sparepart->part_name }}</td>
                    <td>{{ $log->quantity }}</td>
                    <td>{{ $log->user->name }}</td>
                    <td>{{ $log->remarks }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Valeo WMS Audit Report - Internal Use Only
    </div>
</body>
</html>
