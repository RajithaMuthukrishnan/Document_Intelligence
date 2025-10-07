import { Container } from "react-bootstrap";
import UploadSection from "../components/UploadSection";
import SummaryTable from "../components/Table";
import Button from 'react-bootstrap/Button';
// import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';
import { useState } from "react";
import type { DocumentData } from "../types";

function SummaryPage() {
    const [isUploaded, setIsUploaded] =  useState(false);
    const [summaries, setSummaries] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(false); 

    const handleGenerateSummaryClick = async () => {
        setLoading(true); // show spinner
        setSummaries([]); // clear previous summaries

        // Logic to generate summaries for uploaded documents
        console.log("Generate Summary button clicked");
        if (!isUploaded) {
            console.log("please upload files first");
            return;
        }
        // Send a request to the backend to generate summaries
        try{
            const response = await fetch('http://127.0.0.1:5000/generatesummary', {
                method: 'POST',
                credentials: 'include', // Include cookies for session management
            });
            const data: DocumentData[] = await response.json();
            setSummaries(data); // Set results
        } catch (error) {
            console.error("Error sending request:", error);
        }
        finally {
            setLoading(false); // hide spinner
        }
        //  Clear temp files after processing
        await fetch("http://127.0.0.1:5000/clear", { method: "POST" });
    };

    const handleResetClick = () => {
        window.location.reload()
    };


    return (
        <>
            <Container className="mt-4">
                <h1 className="text-center mt-5 mb-4"> Case Insights - Summarization Tool</h1>
                <p className="text-center fst-italic">Disclaimer: This tool demonstrates applied AI capabilities. Outputs are automatically generated and may not be fully accurate; users should independently verify results before relying on them.</p>
            </Container>
            <UploadSection onUploadComplete={setIsUploaded} tool="summary"/>
            {/* create a button to generate summary */}
            <div className="text-center mt-4">
                <Button disabled={!isUploaded} variant="success" size="lg" onClick={handleGenerateSummaryClick}>{loading ? "Generating..." : "Generate Summary"}</Button>
                {!loading && summaries.length > 0 &&(
                    <Button className="ms-2" variant="primary" size="lg" onClick={handleResetClick}>Reset</Button>
                )}
            </div>
            {loading && <div className="text-center mt-5 mb-5 mx-auto" style={{ maxWidth: '600px' }} >
                <Spinner animation="border" variant="success" />
                </div>}
            {!loading && summaries.length > 0 && (
                <Container className="mt-5">
                    <h2 className="mb-4 text-center fst-italic">Generated Summaries</h2>
                    <SummaryTable data={summaries}/>
                </Container>
            )}
        </>
        
    );
}

export default SummaryPage;