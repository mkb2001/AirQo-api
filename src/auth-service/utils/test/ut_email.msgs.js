require("module-alias/register");
const { expect } = require("chai");
const sinon = require("sinon");
const constants = require("@config/constants");
const msgs = require("../email.msgs");

describe("email.msgs", () => {


  describe("recovery_email", () => {
    it("should return the correct recovery email message", () => {
      const token = "example-token";
      const tenant = "example-tenant";
      const expectedMessage =
        "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n" +
        `https://example.com/reset-password?token=${token}&tenant=${tenant}\n\n` +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n";
      const result = constants.recovery_email(token, tenant);
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("joinRequest", () => {
    it("should return the correct join request message with valid first name, last name and email", () => {
      const firstName = "John";
      const lastName = "Doe";
      const email = "john.doe@example.com";
      const name = firstName + " " + lastName;
      const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Your request to join AirQo Analytics has been received, we shall get back to you as soon as possible.
                                    <br />
                                    <br />
                                    Before utilising the AirQo data, your application record has to undergo the process of approval by AirQo Analytics
                                    administration.
                                    <br />
                                    Once your application is approved, you will receive a confirmation email<br />
                                    <br />Please visit our website to learn more about us. <a href="https://airqo.net/">AirQo</a>
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const joinRequestSpy = sinon.spy(msgs, "joinRequest");

      const result = msgs.joinRequest(firstName, lastName, email);
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, email)).to.be.true;
      joinRequestSpy.restore();
    });
  });
  describe("inquiry", () => {
    it("should return the correct inquiry message with valid full name depending on the category", () => {
      const name = "John";
      const email = "john.doe@example.com";
      const categories = ["policy", "partners", "general", "researchers", "developers", "champions"];
      for (let category of categories) {
        let content;
        switch (category) {
          case "policy":
            content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for getting in touch with us and for your interest in our work.
                                    <br />
                                    Kindly let us know how you would like to partner with us and we will get back to you.
                                    <br />
                                    Alternatively, you can get in touch with our Policy Engagement Officer Angela Nshimye at angela@airqo.net who will be of
                                    further support.
                                    <br />
                                </td>
                            </tr>`;
            break;
          case "champions":
            content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for getting in touch with us and for your interest in being an air quality champion in your community.
                                    <br />
                                As an air quality champion, you are key in advocating for clean air practices in your community and urging community
                                members to take action against air pollution.
                                    <br />
                                    Please get in touch with our Marketing and Communications Lead at maclina@airqo.net for further support.
                                    <br />
                                </td>
                            </tr>`;
            break;
          case "researchers":
            content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for your interest in accessing our air quality data to further research in air quality monitoring and
                                management,
                                    <br />
                            You can visit our website at airqo.net and navigate to <a href="https://airqo.net/explore-data">Explore Data</a> or
                            click <a href="https://airqo.net/explore-data">here</a> to access data.
                                    <br />
                                    If you still need further support, please contact our Data Scientists Richard Sserujogi at Richard@airqo.net or Wabinyai
                                    Fidel Raja at raja@airqo.net for further support.
                                    <br />
                                </td>
                            </tr>`;
            break;
          case "developers":
            content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for your interest in our work.
                                    <br />
                            Please get in touch with our Software Engineering Lead Martin Bbaale at martin@airqo.net for further support.
                                    <br />
                                </td>
                            </tr>`;
            break;
          case "general":
          case "partners":
          default:
            content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for getting in touch with us and for your interest in supporting our work in closing the air quality data gaps
                                in African Cities. We are happy to foster partnerships to advance air quality monitoring and management in African
                                Cities.
                                    <br />
                                    <br />
                                    Please get in touch with our project lead Professor Engineer at baino@airqo.net or Programme Manager Deo Okure at
                                    deo@airqo.net for further support.
                                    <br />
                                </td>
                            </tr>`;
            break;
        }
        const expectedMessage = constants.EMAIL_BODY(email, content, name);
        const result = msgs.inquiry(name, email, category);
        expect(result).to.equal(expectedMessage);

      }
    });
  });

  describe("welcome_kcca", () => {
    it("should return the correct welcome message for KCCA with valid inputs", () => {
      const firstName = "John";
      const lastName = "Doe";
      const password = "password123";
      const email = "johndoe@test.com";
      const name = firstName + " " + lastName;
      const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Welcome to the KCCA AirQo air quality monitoring platform.
                                    <br />
                                    Your username is: ${email}
                                    <br />
                                    Your password is: ${password}
                                    <br /><br />
                                    You can always change your password in your account settings after login. Follow this link to access the dashboard right
                                    now: ${constants.LOGIN_PAGE}
                                    <br />
                                    A guide to using AirQo Analytics will be found under the Documentation section of AirQo Analytics
                                    <br /><br />
                                    PLEASE DO NOT REPLY TO THIS EMAIL. For KCCA related questions, please contact:
                                    <ul>
                                        <li>Sadam Yiga: <span
                                                style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">syiga@kcca.go.ug</span>
                                        </li>
                                        <li>Eleth Nakazzi: <span
                                                style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">enakazzi@kcca.go.ug</span>
                                        </li>
                                    </ul>
                                    <br />
                                    If you experience any technical challenges or wish to offer suggestions, please contact us at
                                    <span
                                        style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">support@airqo.net</span>
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const result = msgs.welcome_kcca(
        firstName,
        lastName,
        password,
        email
      );
      const joinRequestSpy = sinon.spy(msgs, "welcome_kcca");
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, password, email)).to.be.true;
      joinRequestSpy.restore();
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("welcome_general", () => {
    it("should return the correct welcome message with valid inputs", () => {
      const firstName = "John";
      const lastName = "Doe";
      const password = "password123";
      const email = "johndoe@test.com";
      const name = firstName + " " + lastName;
      const content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Welcome to AirQo Analytics. Your login credentials are as follows:
                                    <br />
                                    YOUR USERNAME: ${email}
                                    <br />
                                    YOUR PASSWORD: ${password}
                                    <br /><br />
                                    To access the dashboard, please follow this link: <a href="${constants.LOGIN_PAGE}">LOGIN PAGE</a>
                                    <br />
                                    After login, you can change your password in your account settings. You can also use your AirQo Analytics credentials to
                                    access the AirQo API.
                                    <br />
                                    The AirQo API reference can be found here: <a href=" https://docs.airqo.net/airqo-rest-api-documentation/">API
                                        Documentation</a>
                                    <br /><br />
                                    By actively utilising AirQo Analytics, you automatically agree to the <a
                                        href="https://docs.airqo.net/airqo-terms-and-conditions/HxYx3ysdA6k0ng6YJkU3/">AirQo terms and conditions:</a>
                                    <br />
                                    For any technical challenges or suggestions, please contact us at <span
                                        style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">support@airqo.net</span>
                                    <br /><br />
                                    Please note that this is an automated message, so please do not reply to this email.
                                    <br />
                                    To learn more about AirQo Analytics and its features, please refer to the <a
                                        href="https://docs.airqo.net/airqo-platform/">user guide available here:</a>
                                    <br /><br />
                                    Best regards,
                                    <br />
                                    AirQo Data Team
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const result = msgs.welcome_general(
        firstName,
        lastName,
        password,
        email
      );
      const joinRequestSpy = sinon.spy(msgs, "welcome_general");
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, password, email)).to.be.true;
      joinRequestSpy.restore();
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("user_updated", () => {
    it("should return the correct user_updated message with valid inputs", () => {
      const firstName = "John";
      const lastName = "Doe";
      const email = "johndoe@test.com";
      const name = firstName + " " + lastName;
      const updatedData = {
        email: "john.doe@example.com",
        jobTitle: "Software Engineer",
      };
      const updatedFields = Object.keys(updatedData)
        .map((field) => `• ${field}`)
        .join("\n");
      const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your AirQo Analytics account details have been updated.
                                    <br />
                                    The following fields have been updated:
                                    <ol>
                                        ${updatedFields}
                                    </ol>
                                    <br />
                                    If this activity sounds suspicious to you, please reach out to your organization's administrator.
                                    <br />
                                    Follow this link to access AirQo Analytics right now: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const result = msgs.user_updated(
        firstName, lastName, updatedData, email
      );
      const joinRequestSpy = sinon.spy(msgs, "user_updated");
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, updatedData, email)).to.be.true;
      joinRequestSpy.restore();
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("forgotten_password_updated", () => {
    it("should return the correct forgotten_password_updated message with valid inputs", () => {
      const firstName = "John";
      const lastName = "Doe";
      const email = "johndoe@test.com";
      const name = firstName + " " + lastName;
      const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your AirQo Analytics account password has been successfully reset.
                                <br />
                                If you did not initiate this password reset, please reach out to your organization's administrator immediately.
                                    <br />
                                    <br />
                                    Follow this link to access <a href="${constants.LOGIN_PAGE}">AirQo Analytics right now:</a>
                                    <br />
                                    Or Paste this link into your browser: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const result = msgs.forgotten_password_updated(
        firstName, lastName, email
      );
      const joinRequestSpy = sinon.spy(msgs, "forgotten_password_updated");
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, email)).to.be.true;
      joinRequestSpy.restore();
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("known_password_updated", () => {
    it("should return the correct known_password_updated message with valid inputs", () => {
      const firstName = "John";
      const lastName = "Doe";
      const email = "johndoe@test.com";
      const name = firstName + " " + lastName;
      const content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your AirQo Analytics account password has been successfully updated.
                                <br />
                                If you did not initiate this password reset, please reach out to your organization's administrator immediately.
                                    <br />
                                    <br />
                                    Follow this link to access <a href="${constants.LOGIN_PAGE}">AirQo Analytics right now:</a>
                                    <br />
                                    Or Paste this link into your browser: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content, name);
      const result = msgs.known_password_updated(
        firstName, lastName, email
      );
      const joinRequestSpy = sinon.spy(msgs, "known_password_updated");
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(firstName, lastName, email)).to.be.true;
      joinRequestSpy.restore();
      expect(result).to.equal(expectedMessage);
    });
  });
  describe("join_by_email", () => {
    it("should return the correct join_by_email message with valid inputs", () => {
      const email = "john.doe@example.com";
      const token = "ABC123";
      const content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                To get started with "Knowing Your Air" and Breathing Clean, we need to verify your email address.
                                    <br /><br />
                                    Please Enter the code: ${token}
                                    <br /><br />
                                    That's it! Once verified, you'll gain access to all the app's features. Enjoy tracking your air quality and making
                                    informed decisions for a healthier life.

                                    <br />
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content);
      const joinRequestSpy = sinon.spy(msgs, "join_by_email");

      const result = msgs.join_by_email(email, token);
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(email, token)).to.be.true;
      joinRequestSpy.restore();
    });
  });
  describe("authenticate_email", () => {
    it("should return the correct authenticate_email message with valid token", () => {
      const email = "john.doe@example.com";
      const token = "ABC123";
      const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                You are about to make changes to your email address.
                                <br />
                                <br />
                                First, you need you to re-authenticate.
                                    <br />
                                Enter the code below in the app.
                                <br />
                                The code: ${token}
                                    <br />
                                </td>
                            </tr>`;
      const expectedMessage = constants.EMAIL_BODY(email, content);
      const joinRequestSpy = sinon.spy(msgs, "authenticate_email");

      const result = msgs.authenticate_email(token, email);
      expect(result).to.equal(expectedMessage);
      expect(joinRequestSpy.calledOnceWith(token, email)).to.be.true;
      joinRequestSpy.restore();
    });
  });
});
