import styled from 'styled-components';

export const Container = styled.aside`
  position: relative;
`;

export const Content = styled.div`
  background: #30454C;
  border-right: 1px solid #506167;
  position: sticky;
  top: 0;
  left: 0;
  height: 100vh;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;

  strong {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #F7FBFE;
  }

  nav {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 12px;
    }

    &::-webkit-scrollbar-track {
      background: #30454C;
      border-radius: 999px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #506167;
      border-radius: 999px;
      border: 3px solid #30454C;
    }

    p {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #9FA9AC;

      & + a {
        margin-top: 12px;
      }
    }

    a {
      padding: 12px;
      display: block;
      color: #CFD4D6;
      font-weight: 500;
      text-decoration: none;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s ease-in-out;

      &:hover {
        background: rgba(116, 137, 144, 0.5);
      }

      &.active {
        background: #102830;
      }

      & + p {
        margin-top: 16px;
      }
    }
  }

  button {
    width: 100%;
    height: 40px;
    background: #506167;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    gap: 8px;
    border: none;
    border-radius: 8px;
    margin-top: 16px;
    transition: all 0.3s ease-in-out;

    &:hover {
      filter: brightness(1.1);
    }
  }
`;
