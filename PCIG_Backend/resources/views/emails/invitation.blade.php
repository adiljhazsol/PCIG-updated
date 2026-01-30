<!DOCTYPE html>
<html>
<head>
    <title>Invitation to Join PCIG</title>
</head>
<body>
    <h1>Welcome!</h1>
    <p>You have been invited to join the PCIG Investor Portal.</p>
    <p>Please click the link below to complete your registration:</p>
    <p>
        <a href="{{ url('/register?token=' . $invitation->token) }}">Accept Invitation</a>
    </p>
    <p>Or copy and paste this link into your browser:</p>
    <p>{{ url('/register?token=' . $invitation->token) }}</p>
    <p>This invitation is valid until the link expires.</p>
</body>
</html>