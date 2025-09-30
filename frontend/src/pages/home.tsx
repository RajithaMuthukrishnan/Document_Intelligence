import { Container } from "react-bootstrap";
import GridCard from "../components/GridCard";

let featureCards = [
  {
    title: "Case Insights",
    description: "Generate clear and concise summaries for individual or multiple legal documents and case files.",
    buttonText: "Explore Tool",
    buttonLink: "/summarytool"
  },
  {
    title: "Question Answering Tool",
    description: "Ask natural-language questions and receive context-aware answers directly from your legal documents.",
    buttonText: "Explore Tool",
    buttonLink: "/qatool"
  },
  // {
  //   title: "Document Upload",
  //   description: "Easily upload individual or multiple legal documents for analysis and summarization.",
  //   buttonText: "Upload Now",
  //   buttonLink: "/"
  // }
];  

function App() {

  return (
    <>
      {/* Dashboard */}
      <Container className="mt-4">
        <h1 className="text-center mt-5 mb-4">Legal Document Intelligence and Summarization Tool</h1>
        <p className="text-center">A web application that leverages AI to analyze unstructured documents. 
          Users can upload individual files or batches to generate concise summaries, or ask natural-language questions to retrieve answers grounded in their document content.
          The application currently demonstrates legal use cases and can be extended to support other domains.
        </p>
        <p className="text-center fst-italic">Built using LLMs with semantic search and retrieval-augmented generation (RAG) for document-level summarization and question answering.</p>
        <p className="text-center fst-italic">Disclaimer: This tool demonstrates applied AI capabilities. Outputs are automatically generated and may not be fully accurate; users should independently verify results before relying on them.</p>
       </Container>

      <Container className="mt-5 mb-5">
          <GridCard cardsArray={featureCards}></GridCard>
        </Container>
    </>
  );
}

export default App;
