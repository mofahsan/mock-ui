import { useState } from "react";
import PayloadMapperSeller from "./seller/payloadMapperSeller"
import PayloadMapper from "./payloadMapper";
import { NewRequestDiv, NewRequestbutton } from "../styled/section";
import { JourneySection } from "./JourneyUI/JourneySection";
import { SELLER_TAB_TITLE,BUYER_TAB_TITLE,DISPLAY_BUYER,DISPLAY_SELLER,DISPLAY_REQUEST } from "../env/constants";

function Section() {
  const [newRequestContainer, setRequestContainer] = useState(DISPLAY_BUYER ==="true"?"PayloadMapper":"PayloadMapperSeller");

  return (
    <div className="container">
      <NewRequestDiv>
        {DISPLAY_BUYER ==="true" && <NewRequestbutton
          onClick={() => {
            setRequestContainer("PayloadMapper");
          }}
          active={newRequestContainer === "PayloadMapper"}
        >
          Buyer Mock
        </NewRequestbutton>}
        {DISPLAY_REQUEST ==="true" && <NewRequestbutton
          onClick={() => {
            setRequestContainer("JourneySection");
          }}
          active={newRequestContainer === "JourneySection"}
        >
          Request Flow
        </NewRequestbutton>}
        {DISPLAY_SELLER ==="true" && <NewRequestbutton
          onClick={() => {
            setRequestContainer("PayloadMapperSeller");
          }}
          active={newRequestContainer === "PayloadMapperSeller"}
        >
          {SELLER_TAB_TITLE}
        </NewRequestbutton>}
      </NewRequestDiv>

      <div
        style={{
          display: newRequestContainer === "PayloadMapper" ? "block" : "none",
        }}
      >
        <PayloadMapper />
      </div>
      <div
        style={{
          display: newRequestContainer === "JourneySection" ? "block" : "none",
        }}
      >
        <JourneySection containerName={newRequestContainer} />
      </div>
      <div
        style={{
          display: newRequestContainer === "PayloadMapperSeller" ? "block" : "none",
        }}
      >
        <PayloadMapperSeller containerName={newRequestContainer} />
      </div>
    </div>
  );
}

export default Section;
