export interface notFoundCommunicationsError {
  message: string;
  notFoundIds: string[];
}

export interface invalidCommunicationsError {
  message: string;
  invalidItems: invalidCommunicationItem[];
}

export interface invalidCommunicationItem {
  id: string;
  status: string;
  code: string;
}
