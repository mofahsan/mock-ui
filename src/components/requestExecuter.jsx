import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { env } from "../env/env";
import BackIcon from "../assets/png/back.png";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Container,
  HeadingWrapper,
  SendButton,
  Wrapper,
  ResponseField,
  TitleContainer,
  TitleHeading,
  CardHeader,
  CardBody,
  FormContainer,
  ButtonContainer,
  OnPayloadContainer,
  IconsContainer,
  TitleInfo,
  ResetContainer,
  InLineContainer,
  CallContainer,
  WaitingContainer,
  Message,
  StyledCircularProgress,
} from "../styled/requestExecuter.style";
import RenderInput from "./renderInput";
import { useEffect } from "react";
import MakeSlopeChart from "./d3-visualization/MakeMarkovChart";
import ReplayIcon from "@mui/icons-material/Replay";
import Collapse from "@mui/material/Collapse";
import VerticalLinearStepper, {
  QontoConnector,
} from "./verticalProtocolsSteps";
import { StepContent } from "@mui/material";

const RequestExecuter = ({ transactionId, handleBack }) => {
  const [protocolCalls, setProtocolCalls] = useState({});
  const [inputFieldsData, setInputFieldsData] = useState({});
  const [session, setSession] = useState(null);
  const [additionalFlows, setAdditionalFlows] = useState(null);
  const [showAddRequestButton, setShowAddRequestButton] = useState(false);
  const [currentConfig, setCurrentConfig] = useState("");
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestCount = useRef(0);
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm();

  useEffect(() => {
    getSession();
  }, [transactionId]);

  useEffect(() => {
    let firstPayload = false;
    let stopMapper = false;
    Object.entries(protocolCalls).map((data) => {
      const [, call] = data;
      if (call.shouldRender === true && call.executed === false) {
        setCurrentConfig(call.config);
      }
      if (firstPayload || stopMapper) return null;
      if (!call.type.startsWith("on_") && !call.businessPayload) {
        requestCount.current = 0;
        stopMapper = true;
      }
      if (!call.type.startsWith("on_") || call.businessPayload) {
        return null;
      }
      firstPayload = true;
      const session = setTimeout(() => {
        getSession();
        requestCount.current += 1;
      }, 3000);
      if (requestCount.current > 2) {
        clearTimeout(session);
        toast.error("Response timeout");
        sessionTimeout(call.config);
        setShowError(true);
      }
      return null;
    });
  }, [protocolCalls]);

  // auto continue form
  useEffect(() => {
    const checkFormFields = (config) => {
      const inputFields = inputFieldsData[config];
      const call = protocolCalls[config];
      if (!inputFields) return false;
      for (let item of inputFields) {
        console.log(item.key, getValues(item.key));
        console.log(getValues());
        if (item.type === "form") {
          continue;
        }
        if (
          item.defaultValue ||
          call?.businessPayload?.[item.key] ||
          getValues(item.key)
        ) {
          continue;
        }
        return false;
      }
      return true;
    };
    const allFieldsFilled = checkFormFields(currentConfig);
    console.log("allFieldsFilled", allFieldsFilled);
    if (allFieldsFilled && !showError) {
      // auto send next prequest
      // sendRequest(watch(), protocolCalls[currentConfig]);
      // toggleCollapse(protocolCalls[currentConfig]);
    } else {
      if (currentConfig) toggleCollapse(protocolCalls[currentConfig]);
    }
  }, [currentConfig, setValue]);

  const handleSend = async () => {
    await sendRequest(watch(), protocolCalls[currentConfig]);
  };

  const sessionTimeout = async (config) => {
    setShowAddRequestButton(false);

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sandBox}/mapper/timeout`,
        JSON.stringify({ config, transactionId }),
        header
      );

      setInputFieldsData(res.data.session.input);
      setProtocolCalls(res.data.session.protocolCalls);
    } catch (e) {
      console.log("Error while fetching session data", e);
      toast.error(JSON.stringify(e?.message || "Something went wrong"));
    }
  };

  const getSession = async () => {
    setShowAddRequestButton(false);

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.get(
        `${env.sandBox}/cache?transactionid=jm_${transactionId}`,
        header
      );

      setSession(res.data);
      setAdditionalFlows(res.data.additioalFlows);
      setInputFieldsData(res.data.input);
      setProtocolCalls(res.data.protocolCalls);
    } catch (e) {
      console.log("Error while fetching session data", e);
      toast.error(JSON.stringify(e?.message || "Something went wrong"));
    }
  };

  const toggleCollapse = (call) => {
    setProtocolCalls((prevData) => {
      prevData[call.config] = {
        ...prevData[call.config],
        isCollapsed: !call.isCollapsed,
      };

      // if(prevData[call.cofig].unsolicited) {

      // }

      return { ...prevData };
    });
  };

  const displayOnCallData = (call) => {
    const renderedResponse = call.businessPayload.map((item) => {
      return <ResponseField>{JSON.stringify(item)}</ResponseField>;
    });
    return (
      <OnPayloadContainer>
        {renderedResponse}
        <ButtonContainer>
          <SendButton
            disabled={!call?.becknPayload}
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(call.becknPayload, null, 2)
              );
              toast.success("Payload copied!");
            }}
          >
            Copy Beckn Payload
          </SendButton>
        </ButtonContainer>
      </OnPayloadContainer>
    );
  };

  const sendRequest = async (e, call) => {
    setIsLoading(true);
    setShowAddRequestButton(false);

    const data = {};
    Object.entries(e).map((item) => {
      const [key, value] = item;

      if (key.includes("Tag")) {
        const parsedData = JSON.parse(value);
        data[key] = parsedData;
        return;
      }

      data[key] = value;
    });

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sandBox}/mapper/${call.config}`,
        JSON.stringify({
          transactionId: transactionId,
          payload: data,
        }),
        header
      );

      setSession(res.data.session);
      setProtocolCalls(res.data.session.protocolCalls);
    } catch (e) {
      console.log("Error while fetching session data", e);
      toast.error(JSON.stringify(e?.message || "Something went wrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const replayTranscation = async (config) => {
    setShowAddRequestButton(false);
    setShowError(false);
    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sandBox}/mapper/repeat`,
        JSON.stringify({
          transactionId: transactionId,
          config: config,
        }),
        header
      );

      setProtocolCalls(res.data.session.protocolCalls);
    } catch (e) {
      console.log("Error while calling mapper.repeat", e);
      toast.error(JSON.stringify(e?.message || "Something went wrong"));
    }
  };

  const addFlow = async () => {
    setShowAddRequestButton(false);

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sandBox}/mapper/addFlow`,
        JSON.stringify({
          configName: "metro-cancel-flow-1",
          transactionId: transactionId,
        }),
        header
      );

      setProtocolCalls(res.data.session.protocolCalls);
      setInputFieldsData(res.data.session.input);
    } catch (e) {
      console.log("Error while calling mapper.repeat", e);
      toast.error(JSON.stringify(e?.message || "Something went wrong"));
    }
  };

  const getOnCallData = () => {
    if (showError) return <div>{`Error: RESPONSE TIMEOUT!`}</div>;
    return (
      <WaitingContainer>
        <Message>WAITING FOR RESPONSE</Message>
        <CircularProgress />
      </WaitingContainer>
    );
  };

  const renderRequestContainer = (call) => {
    return (
      <Step key={call.config} connector={<QontoConnector />} active={true}>
        <StepLabel>{call.config}</StepLabel>
        <StepContent>
          <CallContainer>
            <CardHeader onClick={() => toggleCollapse(call)}>
              <HeadingWrapper>{call.config}</HeadingWrapper>
              <InLineContainer>
                {!call.type.startsWith("on_") && (
                  <ResetContainer
                    onClick={() => replayTranscation(call.config)}
                  >
                    <div>Reset</div>
                    <ReplayIcon />
                  </ResetContainer>
                )}
                <ResetContainer>
                  <IconsContainer rotation={call.isCollapsed ? 270 : 90}>
                    <img
                      src={BackIcon}
                      alt="Description"
                      width={15}
                      height={15}
                    />
                  </IconsContainer>
                </ResetContainer>
              </InLineContainer>
            </CardHeader>
            <CardBody isCollapsed={call.isCollapsed}>
              {call.type.startsWith("on_") ? (
                <>
                  {call.businessPayload
                    ? displayOnCallData(call)
                    : getOnCallData()}
                </>
              ) : (
                <FormContainer
                  onSubmit={handleSubmit((data) => {
                    sendRequest(data, call);
                  })}
                >
                  {inputFieldsData[call.config].map((item) => (
                    <RenderInput
                      data={{
                        ...item,
                        config: call.config,
                        currentConfig: currentConfig,
                        defaultValue:
                          call?.businessPayload?.[item.key] ||
                          item.defaultValue,
                        businessPayload:
                          protocolCalls[call.preRequest]?.businessPayload,
                        session: session,
                      }}
                      control={control}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  ))}
                </FormContainer>
              )}
            </CardBody>
            {!call.type.startsWith("on_") && (
              <ButtonContainer>
                <SendButton
                  disabled={!call?.becknPayload || call.type === "form"}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(call.becknPayload, null, 2)
                    );
                    toast.success("Payload copied!");
                  }}
                >
                  Copy Beckn Payload
                </SendButton>
                <SendButton
                  disabled={call.executed || isLoading}
                  type="submit"
                  onClick={handleSend}
                >
                  {call.type === "form" ? "Continue" : "Send"}
                </SendButton>
              </ButtonContainer>
            )}
          </CallContainer>
        </StepContent>
      </Step>
    );
  };
  let activeStep = 0;
  const steps = Object.entries(protocolCalls).flatMap((data) => {
    const [key, call] = data;
    return { label: call.config };
  });
  const entries = Object.entries(protocolCalls);
  for (let i = 0; i < steps.length; i++) {
    if (entries[i][1].shouldRender) {
      activeStep = i;
    }
  }
  return (
    <Wrapper>
      <TitleContainer>
        <TitleHeading>
          <img
            onClick={handleBack}
            src={BackIcon}
            alt="Description"
            width={15}
            height={15}
          />
          <h2>{session?.summary}</h2>
        </TitleHeading>
        <TitleInfo>
          <div>
            <p>Transaction ID :</p>
            <small>{transactionId}</small>
          </div>
          <div>
            <p>Domain :</p>
            <small>{session?.domain}</small>
          </div>
          <div>
            <p>Versoin :</p>
            <small>{session?.version}</small>
          </div>
          <div>
            <p>Country :</p>
            <small>{session?.cityCode}</small>
          </div>
          <div>
            <p>City :</p>
            <small>{session?.country}</small>
          </div>
        </TitleInfo>
      </TitleContainer>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* <VerticalLinearStepper protocolCalls={protocolCalls} /> */}
        <div style={{ width: "100%" }}>
          <Box>
            <Stepper
              orientation="vertical"
              activeStep={activeStep}
              connector={<QontoConnector />}
            >
              {Object.entries(protocolCalls).flatMap((data, index) => {
                const [key, call] = data;

                if (call.shouldRender && call.unsolicited) {
                  return [
                    renderRequestContainer(call.unsolicited),
                    renderRequestContainer(call),
                  ];
                }

                if (call.shouldRender) {
                  return renderRequestContainer(call);
                }
                return (
                  <Step key={index}>
                    <StepLabel>{call.config}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
          {showAddRequestButton && <>Add Request</>}
        </div>
      </div>
    </Wrapper>
  );
};

// function GetCollapsedState(call) {}

export default RequestExecuter;
