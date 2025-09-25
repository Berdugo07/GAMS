export interface internal {
  _id: string;
  code: string;
  cite: string;
  account: string;
  state: string;
  reference: string;
  numberOfDocuments: string;
  send: boolean;
  group: string;
  createdAt: string;
  updatedAt: string;
  isSend: boolean;
  sender: worker;
  recipient: worker;
}

interface worker {
  fullname: string;
  jobtitle: string;
}
