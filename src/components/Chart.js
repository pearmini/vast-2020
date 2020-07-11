import React from "react";
import styled from "styled-components";

const Container = styled.div`
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  padding: 20px 8px;
`;

export default function ({ width, height, children }) {
  return (
    <Container width={width} height={height}>
      {children}
    </Container>
  );
}
