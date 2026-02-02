<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payoff Request Letters</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #333;
        }
        .page-break {
            page-break-after: always;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .company-info {
            font-size: 10pt;
            color: #666;
        }
        .recipient-section {
            margin-bottom: 30px;
        }
        .letter-body {
            margin-bottom: 30px;
            text-align: justify;
        }
        .table-section {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
        }
        .table-section th, .table-section td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .table-section th {
            background-color: #f2f2f2;
        }
        .footer {
            margin-top: 50px;
            font-size: 10pt;
            color: #666;
            text-align: center;
        }
        .signature {
            margin-top: 50px;
        }
    </style>
</head>
<body>
    @foreach($requests as $req)
    <div class="letter-container">
        <div class="header">
            <div class="company-name">Peach Capital Investment Group</div>
            <div class="company-info">
                123 Investment Blvd, Suite 100<br>
                Atlanta, GA 30303<br>
                Phone: (555) 123-4567 | Email: support@peachcapital.com
            </div>
        </div>

        <div class="recipient-section">
            <p><strong>Date:</strong> {{ date('F d, Y') }}</p>
            <p><strong>To:</strong><br>
            {{ $req->requester_name ?? $req->lawyer_name }}<br>
            @if(isset($req->lawyer_firm_name)) {{ $req->lawyer_firm_name }}<br> @endif
            {{ $req->requester_email ?? $req->lawyer_email }}</p>
        </div>

        <div class="letter-body">
            <p><strong>Subject: Payoff Quote for Request #{{ $req->display_id }}</strong></p>
            
            <p>Dear {{ $req->requester_name ?? $req->lawyer_name }},</p>
            
            <p>Thank you for your inquiry regarding the payoff amount for the property listed below. Please find the details of the payoff amount calculated as of today's date.</p>
        </div>

        <table class="table-section">
            <tr>
                <th colspan="2">Property Details</th>
            </tr>
            <tr>
                <td width="30%"><strong>Address:</strong></td>
                <td>{{ $req->property?->address ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Parcel ID:</strong></td>
                <td>{{ $req->property?->parcel_id ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>County:</strong></td>
                <td>{{ $req->property?->county ?? 'N/A' }}</td>
            </tr>
        </table>

        <table class="table-section">
            <tr>
                <th colspan="2">Payoff Calculation</th>
            </tr>
            <tr>
                <td width="70%">Principal Amount</td>
                <td width="30%">${{ number_format($req->amount ?? 0, 2) }}</td>
            </tr>
            <tr>
                <td>Processing Fees</td>
                <td>$50.00</td>
            </tr>
            <tr>
                <td><strong>Total Payoff Amount</strong></td>
                <td><strong>${{ number_format(($req->amount ?? 0) + 50, 2) }}</strong></td>
            </tr>
        </table>

        <div class="letter-body">
            <p>This quote is valid for 10 days from the date of this letter. Please remit payment via wire transfer or certified check to the account details provided in a separate secure communication.</p>
            
            <p>If you have any questions, please contact our support team referencing the Request ID above.</p>
        </div>

        <div class="signature">
            <p>Sincerely,</p>
            <br>
            <p><strong>Admin Team</strong><br>
            Peach Capital Investment Group</p>
        </div>

        <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
        </div>
    </div>

    @if(!$loop->last)
        <div class="page-break"></div>
    @endif
    @endforeach
</body>
</html>
