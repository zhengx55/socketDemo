import styled, { keyframes } from "styled-components";

const animate = keyframes`
    0%{transform: translateY(0)}
    60%{transform: translateY(0)}
    80%{transform: translateY(-20px)}
    100%{transform: translateY(0px)}
`;

export const Dot = styled.ul`
  margin: 0 0 10px 0;
  padding: 0;
  height: 20px;
  display: flex;
  .dot {
    list-style: none;
    width: 20px;
    height: 20px;
    background-color: #c69953;
    margin: 0 5px;
    border-radius: 50%;
    animation: ${animate} 1.4s linear infinite;
    &:nth-child(1) {
      animation-delay: 0;
    }
    &:nth-child(2) {
      animation-delay: -1.2s;
    }
    &:nth-child(3) {
      animation-delay: -1s;
    }
    &:nth-child(4) {
      animation-delay: -0.8s;
    }
    &:nth-child(5) {
      animation-delay: -0.6s;
    }
  }
`;
