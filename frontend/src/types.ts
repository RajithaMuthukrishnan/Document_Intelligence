export interface DocMetadata {
  case_id?: string;
  case_name?: string;
  attorneys?: string;
  summary?: string;
}

export interface DocumentData {
  metadata: DocMetadata;
  page_content: string;
}