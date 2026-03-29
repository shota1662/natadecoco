<?php
// ============================================================
//  NPOナタデココ お問い合わせフォーム 送信処理
// ============================================================

// ① 受信先メールアドレス（実際のアドレスに変更してください）
$to = 'info@example.com';

// ② POSTメソッド以外はトップへ
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contact.html');
    exit;
}

// ============================================================
//  入力値取得 & サニタイズ
// ============================================================
$name     = isset($_POST['name'])     ? trim(htmlspecialchars($_POST['name'],     ENT_QUOTES, 'UTF-8')) : '';
$email    = isset($_POST['email'])    ? trim($_POST['email'])                                           : '';
$tel      = isset($_POST['tel'])      ? trim(htmlspecialchars($_POST['tel'],      ENT_QUOTES, 'UTF-8')) : '';
$category = isset($_POST['category']) ? trim($_POST['category'])                                        : '';
$message  = isset($_POST['message'])  ? trim(htmlspecialchars($_POST['message'],  ENT_QUOTES, 'UTF-8')) : '';
$privacy  = isset($_POST['privacy'])  ? true : false;

// ============================================================
//  バリデーション
// ============================================================
$errors = [];

if (empty($name))     $errors[] = 'お名前が入力されていません。';
if (empty($email))    $errors[] = 'メールアドレスが入力されていません。';
if (empty($category)) $errors[] = 'お問い合わせ種別が選択されていません。';
if (empty($message))  $errors[] = 'お問い合わせ内容が入力されていません。';
if (!$privacy)        $errors[] = '個人情報保護方針への同意が必要です。';

// メールアドレス形式チェック
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません。';
}

// カテゴリ許可値チェック
$allowed_categories = ['event', 'volunteer', 'sponsor', 'media', 'other'];
if (!in_array($category, $allowed_categories)) {
    $errors[] = '不正なお問い合わせ種別です。';
}

if (!empty($errors)) {
    header('Location: contact.html?error=1');
    exit;
}

// ============================================================
//  カテゴリ → 日本語ラベル変換
// ============================================================
$category_labels = [
    'event'     => 'イベントについて',
    'volunteer' => 'ボランティアについて',
    'sponsor'   => 'スポンサー・支援について',
    'media'     => '報道・取材について',
    'other'     => 'その他',
];
$category_label = $category_labels[$category];

// ============================================================
//  メール送信（運営宛）
// ============================================================
mb_language('Japanese');
mb_internal_encoding('UTF-8');

$subject = '【お問い合わせ】' . $category_label . ' - ' . $name . ' 様';

$body  = "NPOナタデココ お問い合わせフォームより\n";
$body .= "======================================\n\n";
$body .= "【お名前】\n" . $name . "\n\n";
$body .= "【メールアドレス】\n" . $email . "\n\n";
if (!empty($tel)) {
    $body .= "【電話番号】\n" . $tel . "\n\n";
}
$body .= "【お問い合わせ種別】\n" . $category_label . "\n\n";
$body .= "【お問い合わせ内容】\n" . $message . "\n\n";
$body .= "======================================\n";
$body .= "送信日時: " . date('Y-m-d H:i:s') . "\n";

$headers  = "From: noreply@example.com\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$result = mb_send_mail($to, $subject, $body, $headers);

if (!$result) {
    header('Location: contact.html?error=1');
    exit;
}

// ============================================================
//  自動返信メール（送信者宛）
// ============================================================
$auto_subject = '【NPOナタデココ】お問い合わせを受け付けました';

$auto_body  = $name . " 様\n\n";
$auto_body .= "この度はNPOナタデココにお問い合わせいただきありがとうございます。\n";
$auto_body .= "下記の内容でお問い合わせを受け付けました。\n\n";
$auto_body .= "--------------------------------------\n";
$auto_body .= "【お問い合わせ種別】\n" . $category_label . "\n\n";
$auto_body .= "【お問い合わせ内容】\n" . $message . "\n";
$auto_body .= "--------------------------------------\n\n";
$auto_body .= "担当者より3営業日以内にご連絡いたします。\n";
$auto_body .= "しばらくお待ちくださいますようお願い申し上げます。\n\n";
$auto_body .= "NPOナタデココ\n";
$auto_body .= "https://example.com\n";   // ← サイトURLに変更してください

$auto_headers  = "From: info@example.com\r\n";   // ← 実際の送信元アドレスに変更
$auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mb_send_mail($email, $auto_subject, $auto_body, $auto_headers);

// ============================================================
//  完了ページへリダイレクト
// ============================================================
header('Location: contact.html?sent=1');
exit;
