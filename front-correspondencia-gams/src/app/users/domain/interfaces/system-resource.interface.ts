export interface systemResource {
  value: string;
  label: string;
  actions: actionResource[];
  isSelected: boolean;
}

export interface actionResource {
  value: string;
  label: string;
  isSelected: boolean;
}
