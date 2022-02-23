import React from "react";
import styled, { keyframes } from "styled-components";
import { FiRotateCw } from "react-icons/fi";

const borderIncrease = keyframes`100% { border-width:20px 10px; }`;

const fadeIn = keyframes`100%{  opacity:1; }`;

const rotateRight = keyframes`100%{ transform: rotate(90deg); }`;

const sizeIncrease = keyframes` 
0%   { width: 0; height: 10px; }
50%  { width: 0; height: 50px; }
100% { width: 100px; height:160px; }`;

const Background = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #3d3835;
`;

const PhoneContainer = styled.div`
  width: 80%;
  height: max-content;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  & p {
    display: inline-block;
    width: 100%;
    text-align: center;
    margin: 0;
    color: #fff;
    font-size: 20px;
    opacity: 0;
    animation: ${fadeIn} 0.7s 1.5s forwards ease;
  }
`;

const Phone = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 0;
  height: 0;
  border-style: solid;
  border-color: #000;
  border-width: 0;
  background: #a9a9a9;
  border-radius: 10px;
  animation: ${sizeIncrease} 0.8s forwards ease-in,
    ${borderIncrease} 1s 0.5s forwards ease,
    ${rotateRight} 0.7s 1s forwards ease;
  .icon {
    opacity: 0;
    transform: rotate(270deg);
    animation: ${fadeIn} 0.7s 1.5s forwards ease;
  }
`;

function portrait() {
  return (
    <Background>
      <PhoneContainer>
        <Phone>
          <FiRotateCw size="50px" className="icon" />
        </Phone>
        <p>Please rotate your device</p>
      </PhoneContainer>
    </Background>
  );
}

export default portrait;
