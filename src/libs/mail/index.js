import Mailjet from "node-mailjet";
const { MJ_API_KEY, MJ_SECRET_KEY, MJ_FROM_EMAIL, MJ_FROM_NAME } = process.env;

class Mail {
  constructor(email, name) {
    this.public_key = MJ_API_KEY;
    this.private_key = MJ_SECRET_KEY;
    this.fromEmail = MJ_FROM_EMAIL;
    this.fromName = MJ_FROM_NAME;
    this.toEmail = email;
    this.toName = name;
  }

  async connectApi() {
    return await Mailjet.apiConnect(this.public_key, this.private_key);
  }

  async sendEmail(Subject, TextPart, HTMLPart) {
    try {
      const mailjet = await this.connectApi();
      const result = await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: this.fromEmail,
              Name: this.fromName,
            },
            To: [
              {
                Email: this.toEmail,
                Name: this.toName,
              },
            ],
            Subject: Subject,
            TextPart: TextPart,
            HTMLPart: HTMLPart,
          },
        ],
      });
      return result;
    } catch (error) {
      return error;
    }
  }
}

export const sendForgotEmail = async (email, name, token) => {
  const Subject = "Redefinição de Senha";
  const TextPart = "Equipe Scrum App";
  const HTMLPart = `<h2>Hi ${name} </h2><br/> Aqui está o código para redefinir a sua senha:<br/><br/><h1>${token}</h1><br/><br/>Caso não tenha feito essa solicitação, ignore essa mensagem<br/>`;

  const mail = new Mail(email, name);
  return await mail.sendEmail(Subject, TextPart, HTMLPart);
};
