import * as React from "react";
import { styled } from "@mui/material/styles";
import StepIcon from "@mui/material/StepIcon";
import { green } from "@mui/material/colors";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";

export const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#0080FF",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#0080FF",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 10,
    borderRadius: 1,
    Height: 10,
    borderLeftWidth: 1,
  },
}));
