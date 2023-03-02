import styled from 'styled-components';

export const Container = styled.div`
  margin-top: 20px;

  > header {
    display: flex;
    gap: 8px;
    align-items: flex-end;

    h3 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }

    div {
      display: flex;
      gap: 8px;
      align-items: center;

      strong {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .card {
    width: 100%;
    padding: 16px;
    display: flex;
    flex-direction: column;
    background: #30454C;
    border-radius: 8px;
    border: 1px solid #506167;
    margin-top: 8px;
    position: relative;

    > header {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      gap: 12px;

      button {
        background: transparent;
        border: none;
        display: flex;
      }
    }
  }
`;

export const Loader = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(48, 69, 76, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

