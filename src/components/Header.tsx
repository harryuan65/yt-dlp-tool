import styled from "styled-components";

const HeaderContainer = styled.header`
  background-color: #2d2d30;
  border-bottom: 1px solid #3e3e42;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const Version = styled.span`
  font-size: 12px;
  color: #888;
  margin-left: 8px;
`;

function Header() {
  return (
    <HeaderContainer>
      <Title>
        yt-dlp Desktop
        <Version>v1.0.0</Version>
      </Title>
    </HeaderContainer>
  );
}

export default Header;
