<!DOCTYPE html>
<html>
<head>
    <title>Welcome to the Team!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
        }
        .btn-container {
            text-align: center;
            margin-top: 20px;
        }
        .login-btn {
            background-color: #4CAF50;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .login-btn:hover {
            background-color: #45a049;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Welcome Aboard! 🎉</h1>
        <p>We’re excited to have you join as a <strong>{{ $employee->roles->first()->name }}</strong>!</p>

        <p><strong>Your Details:</strong></p>
        <p>Name: <strong>{{ $employee->name }}</strong></p>
        <p>Email: <strong>{{ $employee->email }}</strong></p>
        <p>Company Code: <strong>{{ $companyCode }}</strong></p>

        <p>Please click the button below to set your password:</p>

        <!-- <div class="btn-container">
            <a href="{{ url('/create-password/{{ $employee->id }}') }}" class="login-btn">Set Your Password</a>
        </div> -->

        <div class="footer">
            <p>If you have any questions, feel free to contact us!</p>
        </div>
    </div>
</body>
</html>
