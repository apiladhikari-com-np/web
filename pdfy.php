<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>password_verify</title>
</head>
<body>
    <?php
    header('Location: file:///etc/passwd');
    exit; // Ensure no further execution occurs
    ?>
</body>
</html>
