import React, { useRef } from "react";
import styled from "styled-components";
import useSize from "../hooks/useSize";

const Container = styled.div`
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height || "100%"};
`;

export default function ({ width, height, children }) {
  const ref = useRef(null);
  const { width: containerWidth, height: containerHeight } = useSize(ref);
  return (
    <Container width={width} height={height} ref={ref}>
      {children(containerWidth, containerHeight)}
    </Container>
  );
}
