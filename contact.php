<?php
/* ============================================================
   Pixellize — Contact form mailer
   ------------------------------------------------------------
   1. Set $recipient below to the address that should receive
      messages.
   2. Upload this file to a PHP-enabled host (shared hosting,
      cPanel, etc). The form POSTs here via AJAX.
   3. If your host blocks PHP mail(), switch to SMTP
      (e.g. PHPMailer) — see the note at the bottom.
   ============================================================ */

header('Content-Type: application/json; charset=utf-8');

// ---- CONFIG -------------------------------------------------
$recipient = 'hello@pixellize.com';   // <-- CHANGE to your email
// -------------------------------------------------------------

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Honeypot: real users leave "website" empty; bots tend to fill it.
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true, 'message' => 'Thanks!']); // silently drop
    exit;
}

// Strip CR/LF to prevent email header injection
function clean($v) {
    return trim(str_replace(["\r", "\n", "%0a", "%0d"], ' ', (string) $v));
}

$name    = clean($_POST['name']    ?? '');
$email   = clean($_POST['email']   ?? '');
$subject = clean($_POST['subject'] ?? '');
$message = trim($_POST['message']  ?? '');

// Validation
$fields = [];
if ($name === '')                                     $fields[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))       $fields[] = 'email';
if ($message === '')                                  $fields[] = 'message';

if ($fields) {
    http_response_code(422);
    echo json_encode([
        'ok'     => false,
        'error'  => 'Please fill in all required fields correctly.',
        'fields' => $fields,
    ]);
    exit;
}

// Build the email
$subjectLine = $subject !== '' ? $subject : 'New message from your website';

$body  = "You have a new message from the contact form:\n\n";
$body .= "Name:    $name\n";
$body .= "Email:   $email\n";
$body .= "Subject: $subjectLine\n\n";
$body .= "Message:\n$message\n";

$fromDomain = preg_replace('/[^a-z0-9.\-]/i', '', $_SERVER['HTTP_HOST'] ?? 'localhost');

$headers  = "From: Website <no-reply@$fromDomain>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$sent = @mail($recipient, $subjectLine, $body, $headers);

if ($sent) {
    echo json_encode(['ok' => true, 'message' => 'Thanks! Your message has been sent.']);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Message could not be sent. Please try again later.']);
}

/* ------------------------------------------------------------
   SMTP alternative (recommended for reliable delivery):
   composer require phpmailer/phpmailer, then replace the
   mail() call above with a configured PHPMailer instance.
   ------------------------------------------------------------ */
