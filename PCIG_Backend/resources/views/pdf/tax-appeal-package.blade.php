<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Tax Appeal Package</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
        .row { display: table; width: 100%; margin-bottom: 5px; }
        .label { display: table-cell; font-weight: bold; width: 200px; }
        .value { display: table-cell; }
        .documents-list { list-style-type: none; padding: 0; }
        .documents-list li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Tax Appeal Package</h1>
        <p>Generated on {{ $generated_at }}</p>
    </div>

    <div class="section">
        <div class="section-title">Property Information</div>
        <div class="row">
            <div class="label">Property Address:</div>
            <div class="value">{{ $property->address ?? 'N/A' }}, {{ $property->city ?? '' }}, {{ $property->state ?? '' }} {{ $property->zip_code ?? '' }}</div>
        </div>
        <div class="row">
            <div class="label">Parcel ID:</div>
            <div class="value">{{ $property->parcel_id ?? 'N/A' }}</div>
        </div>
        <div class="row">
            <div class="label">County:</div>
            <div class="value">{{ $property->county ?? 'N/A' }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Appeal Details</div>
        <div class="row">
            <div class="label">Filed Date:</div>
            <div class="value">{{ $appeal->filed_date ? \Carbon\Carbon::parse($appeal->filed_date)->format('M d, Y') : 'N/A' }}</div>
        </div>
        <div class="row">
            <div class="label">Hearing Date:</div>
            <div class="value">{{ $appeal->hearing_date ? \Carbon\Carbon::parse($appeal->hearing_date)->format('M d, Y') : 'Not Scheduled' }}</div>
        </div>
        <div class="row">
            <div class="label">Status:</div>
            <div class="value">{{ ucfirst(str_replace('_', ' ', $appeal->status)) }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Assessment Information</div>
        <div class="row">
            <div class="label">Current Assessment:</div>
            <div class="value">${{ number_format($appeal->current_assessment, 2) }}</div>
        </div>
        <div class="row">
            <div class="label">Proposed Assessment:</div>
            <div class="value">${{ number_format($appeal->proposed_assessment, 2) }}</div>
        </div>
        <div class="row">
            <div class="label">Estimated Savings:</div>
            <div class="value">${{ number_format($appeal->savings, 2) }}</div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Notes</div>
        <p>{!! nl2br(e($appeal->notes ?: 'No notes available.')) !!}</p>
    </div>

    <div class="section">
        <div class="section-title">Attached Documents</div>
        @if($property && $property->documents && $property->documents->whereIn('type', ['tax', 'appeal'])->count() > 0)
            <ul class="documents-list">
            @foreach($property->documents->whereIn('type', ['tax', 'appeal']) as $doc)
                <li>{{ $doc->file_name }} ({{ $doc->created_at->format('M d, Y') }})</li>
            @endforeach
            </ul>
        @else
            <p>No documents attached.</p>
        @endif
    </div>
</body>
</html>