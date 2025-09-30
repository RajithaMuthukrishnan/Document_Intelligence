import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import type { DocumentData, DocMetadata } from '../types';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';

interface SummaryTableProps {
    data: DocumentData[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
    const [show, setShow] = useState(false);
    const [activeSummary, setActiveSummary] = useState<string>("");

    const handleClose = () => setShow(false);
    const handleShow = (summary: string) => {
        setActiveSummary(summary);
        setShow(true);
    };

    if (!data || data.length === 0) {
        return <p>No summaries available.</p>;
    }

    return (
    <>
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Case ID</th>
          <th>Case Name</th>
          <th>Summary Excerpt</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((doc, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{doc.metadata?.case_id || "-"}</td>
            <td>{doc.metadata?.case_name || "Consolidated Summary"}</td>
            <td>{doc.metadata?.summary ? doc.metadata?.summary?.slice(0,120) : doc.page_content?.slice(0,120)}...</td>
            <td><Button variant='outline-primary' size='sm' onClick={() => handleShow(doc.metadata?.summary || doc.page_content)}>View</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
    <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Document Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activeSummary ? activeSummary : "No summary available."}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
    </Modal>
    </>
    );
}

export default SummaryTable;