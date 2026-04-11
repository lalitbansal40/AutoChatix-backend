import { decryptRequest, DecryptRequestResult, encryptResponse, FlowEndpointException } from "../utils/encryption";
import { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(".env") });
import vendors from "../utils/vendors";
const PRIVATE_KEY = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFNTBfBgkqhkiG9w0BBQ0wUjAxBgkqhkiG9w0BBQwwJAQQfK3XAZT3QvEAcDRR
E1XKjgICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEEAa4Bj5MP60sizyk
/38Uj1gEggTQM9lCygtcQ6ISQTKlA3SvQCBYzcnHrE/aC+1mXl9cd7xwh8RRnIXl
H9fRxFyaGVDciyE357wHKDfDXcfQ3lvUDgvbUeB3wrHNoQBQBdSB2wzmC+5d8qLW
x3ZaCn4duCSAtVN0AYZjXDfrrAqEUJJPJ6G8bFiXoNWLqz1ek1o7/BXXqSyY5qqg
ZR34Ogg0Fg/gjwlu20P3CpyrL5uvXkcy1rUFihsx7ArQvaOHlmTIh+OmNuAiw3TN
wtzxxboWs2UWeQD3ug/tpCGNcGJ6JwP3m+srCx1ieezqBT3fanX/3SI6YlHLm7E7
DdlqhhHOLyVF/YB4z8LoGuGJD+8/ZtvLYgXej4JCXT/EHosHcjlTMMT3BvX4QgOH
zH1oeS28n8diVWmsFkCMKl3ld3E6VQ9cpMkSFk1p8KjbZitGRh1/ivy3DwG4tn55
Zze+w3p0tMRbNxsL+xtv+Vao3byb3KSd2lPglSJtwCX6awhXc4ySVQfhexvjs+K3
G6Itkyv+NSZ43eBBDHXaY/djgh+OwJ2bAWJDc6/+V0X6Mlky7F/OFFImJq38WwGw
EBKvR1ukF+vEaasdID/n+ShYrRbqTqwRKaLeeCPFto5R09ZL3WalHxz5wVnZUpCx
uSUmXuxSbDnK3zcWJDpCfSMrqhXZ/pVREPiAleLwWrW0NJb6Uh8BCWh4msn0teox
M1xgEL2L7qvJToCiz0gjh/5aifgHkI7y+TtD88TcAgW7XCLTiFKC532R3dob8hZB
7+MV1JEr7YS8B5MUt80Jnd6g6PrXsq5D/h4FASc+yDTuWDf7uwnTv5nUwmJMOzoV
4iZbHApieYkZW1KUT7/RHXkfY2gL2ARHHZIYTisLAWN6Bk58YcDZGMrcuk6OKGzf
ZEhc8D70rxWfwfLDXJcr1gXMlK2bdOxZw/QKa77M/LnDEv5VREvkEWdiUqd53mc6
NLnOfVONqCoBsOKPblIAzgF9B16pS/xtbuELmGRIBttl9WYF8lanbY/Tt3S9NNTd
gFpN5vK7vZYHDs95PYa0mHA01dZwFwf26tQU2IP6CVukr2sPI8UPcwqOExk7u2J8
ZoTxhV+7Qhi7QpSKHA3GV5YqZ1YZ9mWamI/7PMk/TvJorXTAbuJVak4xTY4sNKQT
/M0CdyD3SO9BxY7uBb+DpZxPwWWZBaqlYgE1WRI4Jcz62Hj9QITUkWqk6SQa6/HJ
HeOhCehoNFSAk89x4vSmxYD7vLwaMLYbrweR/rNhM3vFWBFah5THAIWNbBwYgcqF
GUssamSdUSYIVNcsomMu3DAONuRmzOmQGDqCKBgmzXSPIbbaKnRwjL6K4oZUtDum
nhLK6D7vMgX7W6sfVP03ecSTXkaDMuAAqupI06+W6mEuURvtw2WJ79g690uC/dij
+EYW3+RBb6m0b2eMogyJ16a5glUWLreX74oRwWfsV6L9OlRDblo8lzjeZNtdK2R6
qccXSu1grKnHg//RwTAz/MgvPAd6TQI/19wAx84cE2wTteURXdK+qlOmZWljdLZJ
3sVCKMDLBMrVKDaRePVNpeU7Q+qRIsRfPEv1Udm7CCpKpclrcTpVlQItLe4gySvT
XCTRZp1WpltP/Y709CiwaJfIIcH7U/CIXd11KcAfE6jN+ShdRr40wsM=
-----END ENCRYPTED PRIVATE KEY-----`;




export const whatsappFlowController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    console.log("req.body ::", JSON.stringify(req.body));

    const appName = req.params.appName;

    if (!appName) {
      return res.status(400).json({
        error: "appName not found in path",
      });
    }

    if (!PRIVATE_KEY) {
      throw new Error(
        'Private key is empty. Please check env variable "PRIVATE_KEY".'
      );
    }

    const body = req.body;


    let decryptedRequest;

    try {
      decryptedRequest = decryptRequest(
        body,
        PRIVATE_KEY,
        process.env.PASSPHRASE
      );
    } catch (err: any) {
      if (err instanceof FlowEndpointException) {
        // ⚠️ WhatsApp Flow expects empty body on error
        return res.sendStatus(err.statusCode);
      }
      return res.sendStatus(500);
    }

    const {
      aesKeyBuffer,
      initialVectorBuffer,
      decryptedBody,
    } = decryptedRequest;

    console.log("💬 Decrypted Request:", decryptedBody);

    const VendorFlowClass = vendors[appName]?.flowAppClass;

    if (!VendorFlowClass) {
      return res.status(400).json({
        errors: {
          message: `Invalid appName "${appName}". No flow app registered.`,
        },
      });
    }

    const flowAppObj = new VendorFlowClass();

    const screenResponse = await flowAppObj.getNextScreen(
      decryptedBody,
      appName
    );


    return res
      .status(200)
      .set("Content-Type", "application/octet-stream")
      .send(
        encryptResponse(
          screenResponse,
          aesKeyBuffer,
          initialVectorBuffer
        )
      );
  } catch (error) {
    console.error("Flow controller error:", error);

    return res.status(500).json({
      errors: {
        message:
          "Unhandled endpoint request. Make sure you handle the request action & screen logged above.",
      },
    });
  }
};

