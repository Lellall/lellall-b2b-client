import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { theme } from "@/theme/theme";

const NotFoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 48px;
  color: ${() => theme.colors.primary};
`;

const Message = styled.p`
  font-size: 18px;
  margin: 20px 0;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: ${() => theme.colors.primary};
  color: ${() => theme.colors.primaryFont};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${() => theme.colors.hoverFont};
  }
`;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <NotFoundWrapper>
      <Title>404</Title>
      <Message>Page Not Found</Message>
      <BackButton onClick={() => navigate(-1)}>Go Back</BackButton>
    </NotFoundWrapper>
  );
};

export default NotFound;