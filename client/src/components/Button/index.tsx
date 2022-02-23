import styled from "styled-components";

type ButtonProp = {
  bg?: string;
  color?: string;
  h?: string;
  w?: string;
};

export const Button = styled.button<ButtonProp>`
  height: ${(props) => props.h};
  width: ${(props) => props.w};
  color: ${(props) => props.color};
  background-color: transparent;
  background-image: ${(props) =>
    props.bg ? props.bg : "url('/img/btn_brown.png')"};
  background-position: center;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  font-size: 2vw;
  padding: 0;
  outline: none;
  border: none;
`;
