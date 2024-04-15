import styled from "styled-components";

export const NewRequestDiv = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 35px;
  max-width: 100%;
  border-radius: 5px;
  border: 1px solid #ccc;
  padding: 7px;
`;
export const NewRequestbutton = styled.button`
  z-index: +4;
  text-align: center;
  width: 200px;
  margin-top: 10px;
  border-radius: 8px;
  color: ${(props) => (props.active ? "green" : "black")};
`;
