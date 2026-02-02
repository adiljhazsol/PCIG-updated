<!DOCTYPE html>
<html>
<head>
    <title>Barment Notice</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { margin-bottom: 30px; }
        .property-block { border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Notice of Barment Proceedings</h1>
        <p>Date: {{ now()->format('F d, Y') }}</p>
    </div>

    <div class="content">
        @foreach($properties as $property)
        <div class="property-block">
            <h3>Property Notice</h3>
            <p><strong>Parcel ID:</strong> {{ $property->parcel_id }}</p>
            <p><strong>Address:</strong> {{ $property->address }}</p>
            <p><strong>County:</strong> {{ $property->county }}</p>
            <p>
                This letter serves as formal notice regarding the barment proceedings for the above-referenced property.
                Please contact our office immediately to discuss the status of this case.
            </p>
        </div>
        @endforeach
    </div>
</body>
</html>