export interface onlineAccount {
  id: string;
  userId: string;
  fullname: string;
  jobtitle: string;
  online: boolean;
}
export interface recipient extends onlineAccount {
  isOriginal: boolean;
}
