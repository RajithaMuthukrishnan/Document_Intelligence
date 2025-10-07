import { Container, Row, Col, Card, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import UploadSection from "../components/UploadSection";
import { useState } from "react";
import TypingIndicator from "../components/TypingIndicator";

interface Message {
  role: "user" | "assistant";
  text: string;
  context?: string[];
}

function QAToolPage() {
    // const messages:Message[] = [
    //     // {role:"assistant", text: "Hi!How can I help you?"},
    //     {role:"user", text: "Whats haebes corpus?"},
    //     {role:"assistant", text:"Haebus corpus is..."}
    // ];

    // let contextChunks = ["comes up on tbe petition of the defendants to be discharged from, the custody of the sheriff of the district of Sonoma, under a writ of habeas corpus heretofore issued by this court. The return of the sheriff shows that the petitioners are detained by him by virtue of an order of the judge of First Instance of the district of Sonoma, and that such order was made upon the return of a warrant of arrest against the defendants, charging them with the commission of various felonious acts. Accompanying the return of the sheriff is also to be found a large amount of testimony taken on the examination, going to show that several Indians in the Nappa Valley were shot on the 2Ith day of Feb')","by the prisoner. *10 Where it appeared on the return to a writ of habeas corpus that there was reasonable ground to believe that the prisoners were guilty of burning certain Indian lodges in the Nappa Valley, and of killing several Indians, and perpetrating other outrages, they were, nevertheless, admitted to bail, on the grounds solely that the district courts had not as yet been organized, nor their terms fixed, nor the judges appointed, and that there was no secure place in which the prisoners could be kept until they could be brought to trial. It. seems, had not these reasons existed, the prisoners would have been remanded to the custody of the sheriff. The facts are sufficiently stated in the opinion of the court. The cause was argued by O. I). Semple and John B. Weller, for tbe applicants, and by G. J. O. Keioen, (attorney general,) for tbe people. By the Court. Bennett, J. This case comes up on tbe petition of the defendants to be discharged from, the custody of the sheriff of"]

    const [isUploaded, setIsUploaded] =  useState(false);
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [contextChunks, setContextChunks] = useState<string[]>([]);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true)
        try {
            const response = await fetch("http://127.0.0.1:5000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: input }),
            credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "An unknown error occurred");
            }

            const data = await response.json();
            console.log("Answer:", data.answer);
            
            const assistantMessage: Message = {
            role: "assistant",
            text: data.answer,
            context: data.sources || [],
            };
    
            setMessages((prev) => [...prev, assistantMessage]);
            setContextChunks(data.sources || []);
            setLoading(false)
            return { success: true };
        }
        catch (error: any) {
            console.error("Error:", error.message);
            return { success: false, message: error.message };
        }
    }

    return (
        <>
            <Container fluid className="d-flex flex-column overflow-hidden" style={{height: "80vh"}}>
                {/* Header */}
                <Container className="mt-3">
                <h1 className="text-center mt-4 mb-3">QA Tool</h1>
                <p className="text-center fst-italic small">
                    Disclaimer: This tool demonstrates applied AI capabilities. Outputs are automatically generated and may not be fully accurate; users should independently verify results before relying on them.
                </p>
                </Container>

                {/* Upload or Main Content */}
                {!isUploaded && <UploadSection onUploadComplete={setIsUploaded} tool="qa" />}

                {isUploaded && (
                <Container fluid className="flex-grow-1 overflow-hidden">
                    <Row className="h-100">
                    {/* Chat Window */}
                    <Col md={8} className="h-100">
                        <Card className="h-100 d-flex flex-column shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            Legal QA Chat
                        </Card.Header>

                        {/* Scrollable Chat Area */}
                        <Card.Body className="flex-grow-1 overflow-auto">
                            <div className="mb-3">
                            <div
                                className="d-inline-block p-2 rounded-3 bg-light border"
                                style={{ maxWidth: "75%" }}
                            >
                                Hi! I am your Legal Document Intelligence Assistant. I provide answers to your queries strictly based on the documents you've uploaded. 
                                Note that all responses are derived exclusively from the document context and do not include external information.
                            </div>
                            </div>

                            {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`mb-3 ${msg.role === "user" ? "text-end" : ""}`}
                            >
                                <div
                                className={`d-inline-block p-2 rounded-3 ${
                                    msg.role === "user"
                                    ? "bg-primary text-white"
                                    : "bg-light border"
                                }`}
                                style={{ maxWidth: "75%" }}
                                >
                                {msg.text}
                                </div>
                            </div>
                            ))}

                            {/* Typing Indicator */}
                            {loading && (
                            <div className="mb-3">
                                <div
                                className="d-inline-block p-2 rounded-3 bg-light border"
                                style={{ maxWidth: "75%" }}
                                >
                                <TypingIndicator />
                                </div>
                            </div>
                            )}
                        </Card.Body>

                        {/* Footer with Send Disabled While Loading */}
                        <Card.Footer className="bg-light">
                            <Form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const result = await handleSend();
                                if (!result?.success) {
                                setAlertMessage(result?.message);
                                } else {
                                setAlertMessage(null);
                                }
                            }}
                            className="d-flex"
                            >
                            <Form.Control
                                type="text"
                                placeholder="Ask your question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="ms-2"
                                disabled={loading}
                            >
                                {loading ? "..." : "Send"}
                            </Button>
                            </Form>

                            {alertMessage && (
                            <div className="alert alert-danger mt-2" role="alert">
                                {alertMessage}
                            </div>
                            )}
                        </Card.Footer>
                        </Card>
                    </Col>

                    {/* Context Panel */}
                    <Col md={4} className="h-100">
                        <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-secondary text-white">
                            Retrieved Context
                        </Card.Header>
                        <Card.Body className="overflow-auto">
                            {contextChunks.length > 0 ? (
                            contextChunks.map((chunk, i) => (
                                <Card key={i} className="mb-2 border-0 shadow-sm">
                                <Card.Body>
                                    <small>{chunk}</small>
                                </Card.Body>
                                </Card>
                            ))
                            ) : (
                            <p className="text-muted">
                                Ask a question to see retrieved passages.
                            </p>
                            )}
                        </Card.Body>
                        </Card>
                    </Col>
                    </Row>
                </Container>
                )}
            </Container>
        </>
        
    );
};

export default QAToolPage;