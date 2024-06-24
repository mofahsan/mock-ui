import { useState } from "react";
import {
  Input,
  FormContainer,
  FormField,
  Select,
  Label,
  Button,
  Container,
  TransactionId,
} from "../styled/sessionForm.style";
import { toast } from "react-toastify";
import { env } from "../env/env";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useEffect } from "react";
import JourneyDialog from "./JourneyUI/JourneyPage";

const SessionForm = ({ updateStep }) => {
  const [transcations, setTransactions] = useState([]);
  const [flows, setFlows] = useState([]);
  const [additionalFlows, setAdditionalFlows] = useState([]);
  const [formData, setFormData] = useState({
    country: "IND",
    cityCode: "",
    configName: "",
    bpp_id: "",
    additionalFlow: "",
  });
  useEffect(() => {
    getSessions();
    getFlows();
  }, []);

  const getFlows = async () => {
    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.get(`${env.sandBox}/mapper/flows`, header);

      setFlows(res.data.data);
    } catch (e) {
      console.log("Error while fetching flows data", e);
      toast.error(JSON.stringify(e?.response?.data || e?.message));
    }
  };

  const getSessions = async () => {
    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.get(`${env.sandBox}/cache`, header);

      setTransactions(res.data);
    } catch (e) {
      console.log("Error while fetching session data", e);
      toast.error(JSON.stringify(e?.response?.data || e?.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    const transactiomId = uuidv4();

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      await axios.post(
        `${env.sandBox}/mapper/session`,
        JSON.stringify({ ...formData, transaction_id: transactiomId }),
        header
      );
      updateStep(2, transactiomId);
    } catch (e) {
      console.log("error while sending session request", e);
      toast.error(JSON.stringify(e?.response?.data || e?.message));
    }
  };

  const getAdditionalFlows = async (configName) => {
    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        `${env.sandBox}/mapper/additionalFlows/${configName}`,
        header
      );

      setAdditionalFlows(response.data.data);
    } catch (e) {
      console.log("error while fetching additional flows", e);
      toast.error(JSON.stringify(e?.response?.data || e?.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "configName") {
      getAdditionalFlows(value);
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <Container>
      <div style={{ width: "400px" }}>
        <h2>Session Data</h2>
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <FormField>
              <Label htmlFor="config">Flow:</Label>
              <Select
                id="config"
                name="configName"
                onChange={handleInputChange}
              >
                <option selected="selected" disabled="disabled">
                  select value
                </option>
                {flows.map((flow) => {
                  return <option value={flow.value}>{flow.key}</option>;
                })}
              </Select>
            </FormField>

            {additionalFlows.length ? (
              <FormField>
                <Label htmlFor="additionalFlows">Additional Flow:</Label>
                <Select
                  id="additionalFlows"
                  name="additionalFlow"
                  onChange={handleInputChange}
                >
                  <option selected="selected" disabled="disabled">
                    select value
                  </option>
                  {additionalFlows.map((flow) => {
                    return <option value={flow.value}>{flow.key}</option>;
                  })}
                </Select>
              </FormField>
            ) : null}

            <FormField>
              <Label htmlFor="cityCode">City Code:</Label>
              <Input
                type="text"
                id="cityCode"
                name="cityCode"
                value={formData.cityCode}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField>
              <Label htmlFor="bpp_id">Seller Subscriber Id:</Label>
              <Input
                type="text"
                id="bpp_id"
                name="bpp_id"
                value={formData.bpp_id}
                onChange={handleInputChange}
              />
            </FormField>

            <FormField>
              <Label htmlFor="country">Country:</Label>
              <Input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              />
            </FormField>
          </FormContainer>

          <Button type="submit">Submit</Button>
        </form>
      </div>
      <div style={{ width: "400px" }}>
        <h2>Existing Session</h2>
        <div>
          {Object.entries(transcations).map((data) => {
            const [key, value] = data;
            const transactionId = value.substring(3);
            if (value.startsWith("jm_"))
              return (
                <TransactionId onClick={() => updateStep(2, transactionId)}>
                  {transactionId}
                </TransactionId>
              );
          })}
        </div>
      </div>
    </Container>
  );
};

export default SessionForm;
