import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { env } from "../../env/env";
import BackIcon from "../../assets/png/back.png";
import { v4 as uuidv4 } from "uuid";
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
} from "../../styled/requestExecuter.style";
import RenderInput from "../renderInput";
import { useEffect } from "react";
import MakeSlopeChart from "../d3-visualization/MakeMarkovChart";
import ReplayIcon from "@mui/icons-material/Replay";
import Collapse from "@mui/material/Collapse";
import { Switch } from 'antd';
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
  const [auto,setAuto]=useState(false)
  const [call,setCall]= useState({})
  const tempDefaultValue = useRef({});

  const {
    handleSubmit,
    control,
    formState: { errors },
    trigger,
    watch,
    getValues,
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
      // if the call isn't on return the function with assigned values
      // if (!call.type.startsWith("on_") && !call.businessPayload) {
        if (call?.category ==="reciever" && !call.businessPayload) {// if not on
        requestCount.current = 0;
        stopMapper = false;
      }
      if (call?.category ==="reciever" || call.businessPayload) { // if not on
        return null;
      }
      // first payload true if isn't on
      firstPayload = true;

      const session = setTimeout(() => {
        getSession();
        requestCount.current += 1;
      }, 3000);
      // if (requestCount.current > 2) {
      //   clearTimeout(session);
      //   toast.error("Response timeout");
      //   sessionTimeout(call.config);
      //   setShowError(true);
      // }
      return null;
    });
  }, [protocolCalls]);

  const sessionTimeout = async (config) => {
    setShowAddRequestButton(false);

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sellerEngine}/mapper/timeout`,
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
        `${env.sellerEngine}/cache?transactionid=jm_${transactionId}`,
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
        {/* <ButtonContainer>
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
        </ButtonContainer> */}
      </OnPayloadContainer>
    );
  };

  const storeDefaultValue = (key, value) => {
    tempDefaultValue.current = { ...tempDefaultValue.current, [key]: value };
  };

  const sendRequest = async (e, call) => {

    if(call.seller_unsolicited){
       e.message_id = uuidv4()
    }
    setIsLoading(true);
    setShowAddRequestButton(false);
    e = { ...e, ...tempDefaultValue.current };


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
        `${env.sellerEngine}/mapper/${call.config}`,
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

    try {
      const header = {};
      header.headers = {
        ...header.headers,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        `${env.sellerEngine}/mapper/repeat`,
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
        `${env.sellerEngine}/mapper/addFlow`,
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
    return <div>{`Waiting for response`}</div>;
  };

  const renderRequestContainer = (call) => {
    return (
      <Container>
        <CardHeader>
          <HeadingWrapper>{call.config}</HeadingWrapper>
          <IconsContainer rotation={call.isCollapsed ? 270 : 90}>
            {call?.category ==="sender" && ( // if on
              <ResetContainer onClick={() => replayTranscation(call.config)}>
                <div>Reset</div>
                <ReplayIcon />
              </ResetContainer>
            )}
            <img
              onClick={() => toggleCollapse(call)}
              src={BackIcon}
              alt="Description"
              width={10}
              height={10}
            />
          </IconsContainer>
        </CardHeader>
        <CardBody isCollapsed={call.isCollapsed}>
          {call?.category ==="reciever" ? ( // if not on
            <>
              {call.businessPayload ? displayOnCallData(call) : getOnCallData()}
            </>
          ) : (
            <FormContainer
              onSubmit={handleSubmit((data) => {
                sendRequest(data, call);
              })}
            >
              {inputFieldsData[call.config]?.map((item) => (
                <RenderInput
                  data={{
                    ...item,
                    config: call.config,
                    currentConfig: currentConfig,
                    defaultValue:
                      call?.businessPayload?.[item.key] || item.defaultValue,
                    businessPayload:
                      protocolCalls[call.preRequest]?.businessPayload,
                    session: session,
                  }}
                  control={control}
                  errors={errors}
                  watch={watch}
                  storeDefaultValue={storeDefaultValue}

                />
              ))}
              <ButtonContainer>
                {/* <SendButton
                  disabled={!call?.becknPayload || call.type === "form"}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(call.becknPayload, null, 2)
                    );
                    toast.success("Payload copied!");
                  }}
                >
                  Copy Beckn Payload
                </SendButton> */}
                <SendButton disabled={call.executed || isLoading} type="submit">
                  {call.type === "form" ? "Continue" : "Send"}
                </SendButton>
              </ButtonContainer>
            </FormContainer>
          )}
        </CardBody>
        {/* {call.nextRequest === null &&
      additionalFlows &&
      call.becknPayload && (
        <button onClick={addFlow}>add flow</button>
      )} */}
      </Container>
    );
  };

  const handleToggle=()=>{
    setAuto((prevState)=> !prevState)
  }


  const autoSubmitForm = (call) => {
    const data = getValues(); // Prepare data similar to what you do in sendRequest
    // Object.entries(getValues()).forEach(([key, value]) => {
    //   if (key.includes("Tag")) {
    //     const parsedData = JSON.parse(value);
    //     data[key] = parsedData;
    //   } else {
    //     data[key] = value;
    //   }
    // });
    sendRequest(data, call);
  };

  // useEffect to automatically submit the form when auto is true
  useEffect(() => {
    if (auto && currentConfig) {
      const call = protocolCalls[currentConfig];
      if (call.category === "sender" && !call.executed) { // if on
        autoSubmitForm(call);
      }
    }
  }, [auto, currentConfig, protocolCalls]);

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
            <small>Transaction ID :</small>
            <p>{transactionId}</p>
          </div>
          <div>
            <small>Domain :</small>
            <p>{session?.domain}</p>
          </div>
          <div>
            <small>Versoin :</small>
            <p>{session?.version}</p>
          </div>
          <div>
            <small>Country :</small>
            <p>{session?.cityCode}</p>
          </div>
          <div>
            <small>City :</small>
            <p>{session?.country}</p>
          </div>
          <div>
          <Switch onChange={handleToggle} />
          </div>
        </TitleInfo>
      </TitleContainer>

      {Object.entries(protocolCalls).flatMap((data) => {
        //console.log(data,"is the data")
        const [key, call] = data;
        //console.log(call.shouldRender)
        if (call.shouldRender && call.unsolicited) {
          //console.log(call,"is the call")
          return [
            renderRequestContainer(call.unsolicited),
            renderRequestContainer(call),
          ];
        }

        if (call.shouldRender) {
          console.log(call,"<----")
          return renderRequestContainer(call);
        }
      })}

      {showAddRequestButton && <>Add Request</>}
    </Wrapper>
  );
};

export default RequestExecuter;
