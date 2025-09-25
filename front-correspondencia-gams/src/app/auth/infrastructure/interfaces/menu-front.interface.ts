export interface menu {
  icon: string;
  resource: string;
  routerLink: string;
  text: string;
  childred?: menu[];
}

export enum validResource {
  typeProcedures = 'types-procedures',
  communication = 'communication',
  institutions = 'institutions',
  dependencies = 'dependencies',
  groupware = 'groupware',
  external = 'external',
  internal = 'internal',
  officers = 'officers',
  archived = 'archived',
  accounts = 'accounts',
  reports = 'reports',
  roles = 'roles',
  jobs = 'jobs',
  resources = 'resources',
}
