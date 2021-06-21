const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;


function sendOTPEmail(Email) {

  // random 4 digit  
  var num1 = Math.floor(Math.random() * 9) + 1 ; // 1-9
  var num2 = Math.floor(Math.random() * 9) + 1 ; // 1-9
  var num3 = Math.floor(Math.random() * 9) + 1 ; // 1-9
  var num4 = Math.floor(Math.random() * 9) + 1 ; // 1-9
  var temporary_code = `${num1}${num2}${num3}${num4}` 

  // transactional email
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = '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';

  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = "My 2nd subject";
  sendSmtpEmail.htmlContent = `<html><body><h1>code: ${temporary_code}</h1></body></html>`;
  sendSmtpEmail.sender = {"name":"Junior Front-End","email":"khanim97@gmail.com"};
  sendSmtpEmail.to = [{"email":Email}]; 
  sendSmtpEmail.replyTo = {"email":"khanim97@gmail.com","name":"Shervin"};
  sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};
  sendSmtpEmail.params = {"parameter":"My param value","subject":"New Subject"};

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
  }, function(error) { console.error(error); });
  // !transactional email

  return {num1,num2,num3,num4}

}

module.exports = sendOTPEmail
