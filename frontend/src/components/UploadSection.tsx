import { Card } from "react-bootstrap";
import { useState, type ChangeEvent } from "react";

interface UploadSectionProps {
    onUploadComplete: (status: boolean) => void;
    tool: 'summary' | 'qa';
}

function UploadSection({ onUploadComplete, tool }: UploadSectionProps) {
    const [fileList, setFileList] = useState<FileList | null>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        console.log("Event triggered");
        const files = event.target.files;
        if (files) {
            // Process the selected files here
            console.log(files);
            setFileList(files);
        }
    };

    const handleUploadClick = async () => {
        if (!fileList) {
            console.log("No files selected");
            return;
        }
        // Send the files to the backend for processing
        // FormData to send files via an API request
        const formData = new FormData();
        Array.from(fileList).forEach(file => {
            formData.append('files', file);
        });
        formData.append('tool', tool);

        console.log(formData)
        console.log("FormData prepared for upload:", formData.getAll('files'));
        console.log("FormData prepared for upload:", formData.getAll('source'));
        // Use fetch and POST to send formData to the backend
        
        try{
            const response = await fetch('http://127.0.0.1:5000/upload', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for session management
            });
            if (response.ok) {
                onUploadComplete(true); // Update state to indicate successful upload
                console.log("Files uploaded successfully");
            } else {
                console.error("File upload failed");
            }
        } catch (error) {
            console.error("Error uploading files:", error);
        }
    };

    return (
        <>
            <Card className="mt-5 mb-5 mx-auto" style={{ maxWidth: '600px' }}  >
                <Card.Body>
                    <Card.Title>Upload Documents</Card.Title>
                    <Card.Text>
                        You can upload individual or multiple legal documents for analysis and summarization. Please upload files in the following formats: PDF, TXT, HTML.
                    </Card.Text>
                    <input type="file" multiple onChange={handleInputChange}/>
                    <div>
                        <input type="submit" value="Upload" className="btn btn-primary mt-3" onClick={handleUploadClick}/>
                    </div>
                </Card.Body>
            </Card>
        </>

    );
}

export default UploadSection;