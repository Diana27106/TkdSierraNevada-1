<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Ajusta estas rutas según donde hayas colocado la carpeta 'src' de PHPMailer.
// Por ejemplo, si la pusiste en 'tu-sitio-web/lib/PHPMailer/'
require __DIR__ . '/PHPMailer/src/PHPMailer.php';
require __DIR__ . '/PHPMailer/src/SMTP.php';
require __DIR__ . '/PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 1. Recoger y sanear los datos del formulario
    $nombre = htmlspecialchars(trim($_POST['nombre']));
    $email_remitente = htmlspecialchars(trim($_POST['email'])); // El email de quien envía el formulario
    $mensaje = htmlspecialchars(trim($_POST['mensaje']));

    // 2. Validar los datos
    if (empty($nombre) || empty($email_remitente) || empty($mensaje) || !filter_var($email_remitente, FILTER_VALIDATE_EMAIL)) {
        header("Location: contact.html?status=error&message=Por%20favor,%20complete%20todos%20los%20campos%20correctamente.");
        exit();
    }

    // 3. Crear una nueva instancia de PHPMailer
    $mail = new PHPMailer(true); // Pasar 'true' habilita las excepciones para un mejor manejo de errores

    try {
        // Configuración del Servidor SMTP
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();                                            // Usar SMTP para enviar
        $mail->Host       = 'smtp.gmail.com';                       // Servidor SMTP (ej. 'smtp.gmail.com' para Gmail, o el de tu proveedor)
        $mail->SMTPAuth   = true;                                   // Habilitar autenticación SMTP
        $mail->Username   = 'itsdidi071@gmail.com';       // **¡IMPORTANTE! Tu correo remitente (ej. el de tu empresa)**
        $mail->Password   = 'ptelvdmnvqcfelhy';         // **¡IMPORTANTE! Tu contraseña o contraseña de aplicación (si es Gmail)**
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // Habilitar encriptación SSL/TLS (usa PHPMailer::ENCRYPTION_STARTTLS para TLS en puerto 587)
        $mail->Port       = 465;                                    // Puerto SMTP (465 para SMTPS, 587 para STARTTLS)
        $mail->CharSet    = 'UTF-8';                                // Asegura la correcta codificación de caracteres

        // Remitente y Destinatario
        // setFrom() debe ser el mismo correo configurado en Username
        $mail->setFrom('itsdidi071@gmail.com', 'Formulario TKD Sierra Nevada');
        $mail->addAddress('itsdidi071@gmail.com', 'TKD Sierra Nevada');     // El correo de tu empresa donde quieres recibir los mensajes
        $mail->addReplyTo($email_remitente, $nombre);              // El correo al que responderás (el del usuario que envió el formulario)

        // Contenido del Correo
        $mail->isHTML(false);                                      // No usar formato HTML en el cuerpo del mensaje
        $mail->Subject = "Nuevo mensaje de contacto de TKD Sierra Nevada";
        $mail->Body    = "Nombre: " . $nombre . "\n" .
                         "Email: " . $email_remitente . "\n\n" .
                         "Mensaje:\n" . $mensaje;

        // 4. Enviar el correo
        $mail->send();

        // Si el envío fue exitoso, redirigir con mensaje de éxito
        header("Location: contact.html?status=success&message=¡Tu%20mensaje%20se%20ha%20enviado%20correctamente!");
        exit();

    } catch (Exception $e) {
        // Si hay un error, redirigir con mensaje de error
        // Para depuración, puedes ver el error real: error_log("Error PHPMailer: " . $mail->ErrorInfo);
        echo "Error al enviar el mensaje. Mailer Error: {$mail->ErrorInfo}";
        echo "<br>Detalle de la excepción: " . $e->getMessage();
        //header("Location: contact.html?status=error&message=Hubo%20un%20problema%20al%20enviar%20tu%20mensaje.%20Inténtalo%20de%20nuevo%20más%20tarde.");
        exit();
    }

} else {
    // Si alguien intenta acceder directamente a este archivo sin enviar el formulario, redirigir
    header("Location: contact.html");
    exit();
}