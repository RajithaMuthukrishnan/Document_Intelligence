import { Spinner } from "react-bootstrap";

function TypingIndicator() {
  return (
    // <div className="typing-indicator">
    //   <span className="dot"></span>
    //   <span className="dot"></span>
    //   <span className="dot"></span>
    // </div>
    <div className="d-flex align-items-center">
      <Spinner animation="grow" variant="primary" size="sm" className="me-1" />
      <Spinner animation="grow" variant="primary" size="sm" className="me-1" />
      <Spinner animation="grow" variant="primary" size="sm" />
      <span className="ms-2 text-muted small">Assistant is processing...</span>
    </div>
  );
};

export default TypingIndicator;
