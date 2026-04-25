var ADMIN_EMAIL = "ここに運営のメールアドレスを入力";
var EVENT_SHEET_ID = "イベント用スプレッドシートのIDを入力";
var CONTACT_SHEET_ID = "お問い合わせ用スプレッドシートのIDを入力";
function verifyTurnstile(token) {
  if (!token) return false;
  var secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET_KEY');
  var response = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "post",
    payload: {
      secret: secret,
      response: token
    }
  });
  var result = JSON.parse(response.getContentText());
  return result.success === true;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var formType = data.formType || "unknown";
    var email = data.email || "";
    var name = data.parentName || data.name || "";

    // Turnstile検証（contactフォームのみ）
    if (formType === "contact") {
      var token = data["cf-turnstile-response"] || "";
      if (!verifyTurnstile(token)) {
        return ContentService
          .createTextOutput(JSON.stringify({ result: "error", message: "スパム検証に失敗しました。" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    saveToSheet(data, formType);
    if (email) sendAutoReply(email, name, formType, data);
    sendAdminNotification(data, formType, name);
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveToSheet(data, formType) {
  var ssId = (formType === "contact") ? CONTACT_SHEET_ID : EVENT_SHEET_ID;
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(formType);
  if (!sheet) sheet = ss.insertSheet(formType);
  var keys = Object.keys(data);
  var vals = Object.values(data);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["受信日時"].concat(keys));
  }
  sheet.appendRow([new Date()].concat(vals));
}

function getFormLabel(formType) {
  if (formType === "event-20260322") return "国際交流体験クラス(3/22)";
  if (formType === "event-20260328") return "国際交流体験クラス(3/28)";
  if (formType === "event-20260331") return "国際交流体験クラス(3/31)";
  if (formType === "event-20260405") return "国際交流体験クラス(4/5)";
  if (formType === "event-20260412") return "国際交流体験クラス(4/12)";
  if (formType === "event-20260419") return "国際交流体験クラス(4/19)";
  if (formType === "camp-20260530")   return "国際交流キャンプ(5/30-31)";
  if (formType === "class-20260718") return "子どもたちの文化交流教室(7/18)";
  if (formType === "contact")        return "お問い合わせ";
  return formType;
}

function buildBody(lines) {
  return lines.join("\n");
}

function sendAutoReply(email, name, formType, data) {
  var label = getFormLabel(formType);
  var subject = "";
  var body = "";
  var sep = "\n-----------------\n";

  if (formType === "contact") {
    subject = "[NPOナタデデコ] お問い合わせを受け付けました";
    body = buildBody([
      name + " 様",
      "",
      "お問い合わせありがとうございます。",
      "内容を確認の上、担当者より改めてご連絡いたします。",
      sep,
      (data.org ? "学校・団体名：" + data.org : ""),
      "種別：" + (data.category || ""),
      (data.message || ""),
      sep,
      "NPO法人ナタデデコ",
      "info@natadecoco.org"
    ]);

  } else {
    subject = "[NPOナタデデコ] " + label + " お申し込みを受け付けました";
    body = buildBody([
      name + " 様",
      "",
      label + "へのお申し込みありがとうございます。",
      "詳細については改めてご案内いたしますので、もう少々お待ちください。",
      "スタッフ一同お会いできるのを楽しみにしております。",
      sep,
      "お名前：" + name,
      "メール：" + (data.email || ""),
      "お電話：" + (data.tel || ""),
      "お子様の人数：" + (data.childCount || "") + "人",
      (data.message ? "備考：" + data.message : ""),
      sep,
      "NPO法人ナタデデコ",
      "info@natadecoco.org"
    ]);
  }

  GmailApp.sendEmail(email, subject, body);
}

function sendAdminNotification(data, formType, name) {
  var label = getFormLabel(formType);
  var subject = "[フォーム受信] " + label + "：" + name;
  var lines = [];
  var keys = Object.keys(data);
  for (var i = 0; i < keys.length; i++) {
    lines.push(keys[i] + "：" + data[keys[i]]);
  }
  GmailApp.sendEmail(ADMIN_EMAIL, subject, lines.join("\n"));
}
