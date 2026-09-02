export type Roles = "ADMIN" | "USER";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  roles: Roles[];
}

export interface ApiVariables {
  requestId: string;
  user: RequestUser | undefined;
}

export type ApiEnv = {
  Bindings: CloudflareBindings;
  Variables: ApiVariables;
};
